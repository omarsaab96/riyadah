const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const User = require('../models/User'); 
const { body, validationResult } = require('express-validator');

// Create staff
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').notEmpty().withMessage('Role is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array() });
    }

    try {
      const staff = new Staff(req.body);
      if (req.body.profileImage) {
        staff.profileImage = req.body.profileImage;
      }
      await staff.save();

      //search for the email in users table and make a condition if found or else
      const user = await User.findOne({ email: req.body.email });

      if (user) {

      }else{

      }

      res.status(201).json({ success: true, data: staff });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Server error' });
    }
  }
);

// Get all staff
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().populate('teams');
    res.json({ success: true, data: staff });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
});

// Get staff by club
router.post('/byClub/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Club id is required'
    });
  }

  try {
    const staff = await Staff.find({ club: id }).populate('teams');

    res.json({
      success: true,
      data: staff
    });
  } catch (err) {
    console.error('Error fetching staff by club:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get staff by ID
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('teams');
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: 'Staff not found' });
    }
    res.json({ success: true, data: staff });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
});

// Update staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: 'Staff not found' });
    }
    res.json({ success: true, data: staff });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: 'Staff not found' });
    }
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
