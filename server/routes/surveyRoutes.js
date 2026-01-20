const express = require('express');
const router = express.Router();
const Survey = require('../models/survey');
const SurveyResponse = require('../models/surveyResponse');
const Team = require('../models/Team');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, '123456', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const sanitizeOptions = (options = []) =>
  options
    .map(option => ({
      label: String(option?.label ?? option ?? '').trim(),
      value: String(option?.value ?? option ?? '').trim(),
    }))
    .filter(option => option.label && option.value);

const normalizeQuestions = (questions = []) =>
  questions.map(question => ({
    _id: question._id,
    text: String(question.text ?? '').trim(),
    type: question.type,
    description: String(question.description ?? '').trim(),
    required: question.required !== false,
    options: sanitizeOptions(question.options),
    scale: question.scale ? {
      min: Number(question.scale.min ?? 0),
      max: Number(question.scale.max ?? 10),
      step: Number(question.scale.step ?? 1),
    } : undefined,
  }));

const normalizeRepeating = (repeating = {}) => {
  const enabled = Boolean(repeating.enabled);
  const cadence = enabled ? String(repeating.cadence ?? '') : '';
  return {
    enabled,
    cadence: enabled ? (cadence === 'monthly' || cadence === 'post-training' ? cadence : null) : null,
  };
};

const normalizeRestriction = (restrictedTo = {}) => {
  const scope = String(restrictedTo.scope ?? 'none');
  const refId = restrictedTo.refId ? restrictedTo.refId : null;
  if (!['none', 'club', 'coach', 'team'].includes(scope)) {
    return { scope: 'none', refId: null };
  }
  if (scope === 'none') {
    return { scope: 'none', refId: null };
  }
  return { scope, refId };
};

const getUserTeams = async (userId) => {
  return Team.find({
    $or: [{ members: userId }, { coaches: userId }]
  }).select('_id club members coaches');
};

const canUserAccessSurvey = async (userId, survey) => {
  const restriction = survey.restrictedTo || { scope: 'none', refId: null };
  if (!restriction.scope || restriction.scope === 'none') {
    return true;
  }
  if (!restriction.refId) {
    return false;
  }

  if (restriction.scope === 'coach') {
    return String(userId) === String(restriction.refId);
  }

  const teams = await getUserTeams(userId);

  if (restriction.scope === 'team') {
    return teams.some(team => String(team._id) === String(restriction.refId));
  }

  if (restriction.scope === 'club') {
    if (String(userId) === String(restriction.refId)) {
      return true;
    }
    return teams.some(team => String(team.club) === String(restriction.refId));
  }

  return false;
};

const getCoachTeamMemberIds = async (coachId) => {
  const teams = await Team.find({ coaches: coachId }).select('members');
  const memberIds = new Set();
  teams.forEach(team => {
    (team.members || []).forEach(memberId => memberIds.add(String(memberId)));
  });
  return Array.from(memberIds);
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const surveys = await Survey.find({}).sort({ updatedAt: -1 });
    res.json({ surveys });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeSurveys = await Survey.find({ isActive: true }).sort({ updatedAt: -1 });
    let chosen = null;
    for (const survey of activeSurveys) {
      const canAccess = await canUserAccessSurvey(req.user.userId, survey);
      if (canAccess) {
        chosen = survey;
        break;
      }
    }

    if (!chosen) {
      const allSurveys = await Survey.find({}).sort({ updatedAt: -1 });
      for (const survey of allSurveys) {
        const canAccess = await canUserAccessSurvey(req.user.userId, survey);
        if (canAccess) {
          chosen = survey;
          break;
        }
      }
    }

    res.json({ survey: chosen || null });
  } catch (error) {
    console.error('Error fetching active survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/visible', authenticateToken, async (req, res) => {
  try {
    const surveys = await Survey.find({}).sort({ updatedAt: -1 });
    const visible = [];
    for (const survey of surveys) {
      const canAccess = await canUserAccessSurvey(req.user.userId, survey);
      if (canAccess) visible.push(survey);
    }
    res.json({ surveys: visible });
  } catch (error) {
    console.error('Error fetching visible surveys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    const canAccess = await canUserAccessSurvey(req.user.userId, survey);
    if (!canAccess) return res.status(403).json({ error: 'Not authorized to view this survey' });

    const { from, to, userId, limit = 50, skip = 0 } = req.query;
    const filter = { survey: req.params.id };
    if (userId) filter.user = userId;

    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          filter.createdAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          filter.createdAt.$lte = toDate;
        }
      }
      if (Object.keys(filter.createdAt).length === 0) {
        delete filter.createdAt;
      }
    }

    const requestor = await User.findById(req.user.userId).select('role');
    if (requestor?.role === 'Coach') {
      const memberIds = await getCoachTeamMemberIds(req.user.userId);
      if (filter.user) {
        if (filter.user.$in) {
          filter.user.$in = filter.user.$in.filter(id => memberIds.includes(String(id)));
        } else if (!memberIds.includes(String(filter.user))) {
          return res.json({ responses: [], count: 0 });
        }
      } else {
        filter.user = { $in: memberIds };
      }
    }

    const responses = await SurveyResponse.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const count = await SurveyResponse.countDocuments(filter);

    res.json({ responses, count });
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    const canAccess = await canUserAccessSurvey(req.user.userId, survey);
    if (!canAccess) return res.status(403).json({ error: 'Not authorized to view this survey' });
    res.json({ survey });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, isActive, questions, repeating, restrictedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (isActive) {
      await Survey.updateMany({}, { isActive: false });
    }

    const survey = await Survey.create({
      title: String(title).trim(),
      isActive: Boolean(isActive),
      repeating: normalizeRepeating(repeating),
      restrictedTo: normalizeRestriction(restrictedTo),
      questions: normalizeQuestions(questions),
    });

    res.status(201).json({ survey });
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, isActive, questions, repeating, restrictedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (isActive) {
      await Survey.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }

    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      {
        title: String(title).trim(),
        isActive: Boolean(isActive),
        repeating: normalizeRepeating(repeating),
        restrictedTo: normalizeRestriction(restrictedTo),
        questions: normalizeQuestions(questions),
      },
      { new: true, runValidators: true }
    );

    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    res.json({ survey });
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    res.json({ message: 'Survey deleted' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    const canAccess = await canUserAccessSurvey(req.user.userId, survey);
    if (!canAccess) return res.status(403).json({ error: 'Not authorized to submit this survey' });

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    const responseDoc = await SurveyResponse.create({
      survey: survey._id,
      user: req.user.userId,
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        value: answer.value,
      }))
    });

    res.status(201).json({ message: 'Survey submitted', response: responseDoc });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
