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
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, name, club } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        user.isStaff = club;
        await user.save();

        req.body.userRef = user._id;
      } else {
        const newUser = new User({
          achievements: null,
          admin: {
            name: null,
            email: null,
            id: null
          },
          agreed: false,
          bio: null,
          children: null,
          club: club,
          contactInfo: {
            phone: null,
            email: null,
            facebook: null,
            instagram: null,
            whatsapp: null,
            telegram: null,
            tiktok: null,
            snapchat: null,
            location: {
              latitude: null,
              longitude: null
            },
            description: null
          },
          country: null,
          dob: {
            day: null,
            month: null,
            year: null
          },
          email: email,
          events: null,
          gender: null,
          height: null,
          highlights: null,
          image: req.body.image ? req.body.image : null,
          isStaff: club,
          name: name,
          organization: null,
          parentEmail: null,
          password: null,
          personalAccount: false,
          phone: null,
          skills: {
            attack: null,
            skill: null,
            stamina: null,
            speed: null,
            defense: null
          },
          sport: null,
          stats: null,
          type: null,
          verified: null,
          weight: null
        });

        await newUser.save();
        req.body.userRef = newUser._id;
        console.log("Added user with id: ", newUser._id)

      }

      // Create and save staff
      const staff = new Staff(req.body);
      await staff.save();
      console.log("Added staff with id: ", staff._id)

      res.status(201).json({ success: true, data: staff });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
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
    const staff = await Staff.find({ club: id })
      .populate('teams')
      .populate('userRef');

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
    const staff = await Staff.findById(req.params.id)
    .populate('teams')
    .populate('userRef');
    
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
