const express = require('express');
const router = express.Router();
const Survey = require('../models/survey');
const SurveyResponse = require('../models/surveyResponse');
const Team = require('../models/Team');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Attendance = require('../models/Attendance');
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

const getEligibleTrainingSessionsForUser = async (userId) => {
  const attendances = await Attendance.find({ present: userId }).select('event');
  const eventIds = attendances.map(item => item.event).filter(Boolean);
  if (eventIds.length === 0) return [];

  return Schedule.find({
    _id: { $in: eventIds },
    endTime: { $lte: new Date() },
    status: { $ne: 'cancelled' },
    eventType: { $in: ['Training', 'training'] }
  }).select('_id team club coaches endTime');
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
    const visible = [];
    for (const survey of activeSurveys) {
      const canAccess = await canUserAccessSurvey(req.user.userId, survey);
      if (canAccess) visible.push(survey);
    }

    res.json({ surveys: visible });
  } catch (error) {
    console.error('Error fetching active survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/active/summary', authenticateToken, async (req, res) => {
  try {
    const activeSurveys = await Survey.find({ isActive: true }).sort({ updatedAt: -1 });
    const visible = [];
    for (const survey of activeSurveys) {
      const canAccess = await canUserAccessSurvey(req.user.userId, survey);
      if (canAccess) visible.push(survey);
    }

    if (visible.length === 0) {
      return res.json({ surveys: [] });
    }

    const requestor = await User.findById(req.user.userId).select('role');
    const isCoach = requestor?.role === 'Coach';
    const surveyIds = visible.map(survey => survey._id);

    if (isCoach) {
      const memberIds = await getCoachTeamMemberIds(req.user.userId);
      const counts = await SurveyResponse.aggregate([
        { $match: { survey: { $in: surveyIds }, user: { $in: memberIds } } },
        { $group: { _id: '$survey', count: { $sum: 1 } } }
      ]);
      const countMap = new Map(counts.map(item => [String(item._id), item.count]));

      const surveys = visible.map(survey => ({
        _id: survey._id,
        title: survey.title,
        questionsCount: survey.questions?.length || 0,
        repeating: survey.repeating,
        restrictedTo: survey.restrictedTo,
        submissionCount: countMap.get(String(survey._id)) || 0
      }));

      return res.json({ surveys });
    }

    const responses = await SurveyResponse.find({
      survey: { $in: surveyIds },
      user: req.user.userId
    }).select('survey session createdAt');

    const responseMap = new Map();
    responses.forEach(response => {
      const key = String(response.survey);
      if (!responseMap.has(key)) responseMap.set(key, []);
      responseMap.get(key).push(response);
    });

    const trainingSessions = await getEligibleTrainingSessionsForUser(req.user.userId);
    const surveys = [];

    for (const survey of visible) {
      const surveyKey = String(survey._id);
      const surveyResponses = responseMap.get(surveyKey) || [];
      let status = 'pending';
      let pendingCount = 0;

      if (!survey.repeating?.enabled) {
        status = surveyResponses.length > 0 ? 'submitted' : 'pending';
      } else if (survey.repeating?.cadence === 'monthly') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const hasThisMonth = surveyResponses.some(response => response.createdAt >= startOfMonth);
        status = hasThisMonth ? 'submitted' : 'pending';
      } else if (survey.repeating?.cadence === 'post-training') {
        const scope = survey.restrictedTo?.scope || 'none';
        const refId = survey.restrictedTo?.refId ? String(survey.restrictedTo.refId) : null;
        const eligibleSessions = trainingSessions.filter(session => {
          if (scope === 'team' && refId) return String(session.team) === refId;
          if (scope === 'club' && refId) return String(session.club) === refId;
          return true;
        });
        const respondedSessions = new Set(
          surveyResponses.map(response => response.session ? String(response.session) : null).filter(Boolean)
        );
        pendingCount = eligibleSessions.filter(session => !respondedSessions.has(String(session._id))).length;
        status = pendingCount > 0 ? 'pending' : 'up-to-date';
      }

      surveys.push({
        _id: survey._id,
        title: survey.title,
        questionsCount: survey.questions?.length || 0,
        repeating: survey.repeating,
        restrictedTo: survey.restrictedTo,
        status,
        pendingCount
      });
    }

    res.json({ surveys });
  } catch (error) {
    console.error('Error fetching active survey summary:', error);
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

    const { from, to, userId, sessionId, limit = 50, skip = 0 } = req.query;
    const filter = { survey: req.params.id };
    if (userId) filter.user = userId;
    if (sessionId) filter.session = sessionId;

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

    const { answers, sessionId } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    if (!survey.repeating?.enabled) {
      const existing = await SurveyResponse.findOne({ survey: survey._id, user: req.user.userId });
      if (existing) {
        return res.status(409).json({ error: 'Survey already submitted' });
      }
    } else if (survey.repeating?.cadence === 'monthly') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const existing = await SurveyResponse.findOne({
        survey: survey._id,
        user: req.user.userId,
        createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
      });
      if (existing) {
        return res.status(409).json({ error: 'Monthly survey already submitted' });
      }
    } else if (survey.repeating?.cadence === 'post-training') {
      if (!sessionId) {
        return res.status(400).json({ error: 'Training session is required' });
      }

      const session = await Schedule.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Training session not found' });
      }

      if (String(session.eventType || '').toLowerCase() !== 'training') {
        return res.status(400).json({ error: 'Survey is only available for training sessions' });
      }

      if (session.endTime && session.endTime > new Date()) {
        return res.status(400).json({ error: 'Training session has not ended yet' });
      }

      const attendance = await Attendance.findOne({ event: sessionId });
      if (!attendance) {
        return res.status(400).json({ error: 'Attendance not recorded for this session' });
      }

      const isPresent = attendance.present.some(
        (id) => String(id) === String(req.user.userId)
      );
      if (!isPresent) {
        return res.status(403).json({ error: 'Only attendees can submit this survey' });
      }

      const existing = await SurveyResponse.findOne({
        survey: survey._id,
        user: req.user.userId,
        session: sessionId
      });
      if (existing) {
        return res.status(409).json({ error: 'Survey already submitted for this session' });
      }
    }

    const responseDoc = await SurveyResponse.create({
      survey: survey._id,
      user: req.user.userId,
      session: sessionId || null,
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
