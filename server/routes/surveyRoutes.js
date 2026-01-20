const express = require('express');
const router = express.Router();
const Survey = require('../models/survey');
const SurveyResponse = require('../models/surveyResponse');
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
    let survey = await Survey.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!survey) {
      survey = await Survey.findOne({}).sort({ updatedAt: -1 });
    }
    res.json({ survey: survey || null });
  } catch (error) {
    console.error('Error fetching active survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    res.json({ survey });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, isActive, questions } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (isActive) {
      await Survey.updateMany({}, { isActive: false });
    }

    const survey = await Survey.create({
      title: String(title).trim(),
      isActive: Boolean(isActive),
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
    const { title, isActive, questions } = req.body;

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
