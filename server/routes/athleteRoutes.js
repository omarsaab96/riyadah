const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('club').notEmpty().withMessage('Club is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, name, club, phone, gender, country, dob, sport, agreed } = req.body;

      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }

      const normalizedSport = Array.isArray(sport) ? sport : (sport ? [sport] : []);

      const newUser = new User({
        accountBadge: false,
        achievements: null,
        admin: {
          name: null,
          email: null,
          id: null
        },
        agreed: agreed ?? false,
        bio: null,
        children: [],
        clubs: [],
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
        country: country ?? null,
        dob: {
          day: dob?.day ?? null,
          month: dob?.month ?? null,
          year: dob?.year ?? null
        },
        email: email,
        events: null,
        gender: gender ?? null,
        height: null,
        highlights: null,
        image: null,
        isStaff: [],
        name: name,
        organization: null,
        parentEmail: null,
        password: null,
        personalAccount: false,
        phone: phone ?? null,
        role: null,
        skills: {
          attack: null,
          skill: null,
          stamina: null,
          speed: null,
          defense: null
        },
        skillsAreVerified: {
          by: null,
          date: null
        },
        sport: normalizedSport,
        stats: null,
        type: 'Athlete',
        verified: {
          email: null,
          phone: null
        },
        weight: null
      });

      newUser.clubs.push(club);

      await newUser.save();

      res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;
