const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const BulkUpload = require('../models/BulkUpload');
const User = require('../models/User');

const router = express.Router();

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, '123456');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const requireManager = (req, res, next) => {
  if (req.user?.type !== 'Manager') {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  next();
};

const normalizeHeader = (value) => {
  if (!value) return '';
  return String(value).toLowerCase().replace(/\s+/g, '');
};

const extractRows = (sheet) => {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (!raw.length) return [];
  const headers = raw[0].map(normalizeHeader);

  const columnIndex = {
    name: headers.indexOf('name'),
    email: headers.indexOf('email'),
    phone: headers.indexOf('phone'),
    gender: headers.indexOf('gender'),
    sport: headers.indexOf('sport'),
    clubName: headers.indexOf('clubname'),
    clubEmail: headers.indexOf('clubemail'),
    country: headers.indexOf('country')
  };

  return raw.slice(1).map((row, idx) => ({
    rowNumber: idx + 2,
    name: columnIndex.name >= 0 ? String(row[columnIndex.name] || '').trim() : '',
    email: columnIndex.email >= 0 ? String(row[columnIndex.email] || '').trim() : '',
    phone: columnIndex.phone >= 0 ? String(row[columnIndex.phone] || '').trim() : '',
    gender: columnIndex.gender >= 0 ? String(row[columnIndex.gender] || '').trim() : '',
    sport: columnIndex.sport >= 0 ? String(row[columnIndex.sport] || '').trim() : '',
    clubName: columnIndex.clubName >= 0 ? String(row[columnIndex.clubName] || '').trim() : '',
    clubEmail: columnIndex.clubEmail >= 0 ? String(row[columnIndex.clubEmail] || '').trim() : '',
    country: columnIndex.country >= 0 ? String(row[columnIndex.country] || '').trim() : ''
  }));
};

router.get('/template', (req, res) => {
  const headers = [
    ['Name', 'Email', 'Phone', 'Gender', 'Sport', 'Club Name', 'Club Email', 'Country']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(headers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Athletes');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=riyadah_bulk_athletes_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

router.get('/', authenticate, requireManager, async (req, res) => {
  try {
    const uploads = await BulkUpload.find({ manager: req.user._id })
      .sort({ createdAt: -1 })
      .select('filename status totalRows successCount failureCount createdAt');
    res.json({ success: true, data: uploads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/preview', authenticate, requireManager, async (req, res) => {
  try {
    const { fileBase64, filename } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: 'No sheets found in file' });
    }

    const rows = extractRows(workbook.Sheets[sheetName]);
    const errors = [];

    const seenEmails = new Set();
    rows.forEach((row) => {
      if (!row.name || !row.email) {
        errors.push({
          rowNumber: row.rowNumber,
          message: 'Name and email are required'
        });
        return;
      }

      const emailKey = row.email.toLowerCase();
      if (seenEmails.has(emailKey)) {
        errors.push({
          rowNumber: row.rowNumber,
          message: 'Duplicate email in file'
        });
        return;
      }
      seenEmails.add(emailKey);
    });

    const upload = await BulkUpload.create({
      manager: req.user._id,
      filename: filename || null,
      status: 'preview',
      rows,
      errors,
      totalRows: rows.length
    });

    res.json({
      success: true,
      uploadId: upload._id,
      preview: rows,
      errors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to parse file' });
  }
});

router.post('/commit/:id', authenticate, requireManager, async (req, res) => {
  try {
    const upload = await BulkUpload.findOne({ _id: req.params.id, manager: req.user._id });
    if (!upload) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }

    upload.status = 'processing';
    await upload.save();

    const errors = [...upload.errors];
    let successCount = 0;
    let failureCount = 0;
    const credentials = [];
    const errorRows = new Set(errors.map((err) => err.rowNumber));

    for (const row of upload.rows) {
      if (errorRows.has(row.rowNumber)) {
        failureCount += 1;
        continue;
      }

      if (!row.name || !row.email) {
        failureCount += 1;
        continue;
      }

      const existing = await User.findOne({ email: row.email });
      if (existing) {
        errors.push({ rowNumber: row.rowNumber, message: 'Email already exists' });
        failureCount += 1;
        continue;
      }

      if (row.phone) {
        const existingPhone = await User.findOne({ phone: row.phone });
        if (existingPhone) {
          errors.push({ rowNumber: row.rowNumber, message: 'Phone already exists' });
          failureCount += 1;
          continue;
        }
      }

      let clubId = null;
      if (row.clubEmail) {
        const club = await User.findOne({ email: row.clubEmail, type: 'Club' }).select('_id');
        clubId = club?._id || null;
      } else if (row.clubName) {
        const club = await User.findOne({ name: row.clubName, type: 'Club' }).select('_id');
        clubId = club?._id || null;
      }

      const password = `Riyadah#${Math.random().toString(36).slice(-8)}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        accountBadge: false,
        achievements: null,
        admin: {
          name: null,
          email: null,
          id: null
        },
        agreed: true,
        bio: null,
        children: [],
        clubs: clubId ? [clubId] : [],
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
        country: row.country || null,
        dob: {
          day: null,
          month: null,
          year: null
        },
        email: row.email,
        events: null,
        gender: row.gender || null,
        height: null,
        highlights: null,
        image: null,
        isStaff: [],
        name: row.name,
        organization: null,
        parentEmail: null,
        password: hashedPassword,
        personalAccount: false,
        phone: row.phone || null,
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
        sport: row.sport ? [row.sport] : [],
        stats: null,
        type: 'Athlete',
        verified: { email: null, phone: null },
        weight: null
      });

      await newUser.save();
      successCount += 1;
      credentials.push({
        rowNumber: row.rowNumber,
        email: row.email,
        password
      });
    }

    upload.status = 'completed';
    upload.successCount = successCount;
    upload.failureCount = failureCount;
    upload.errors = errors;
    await upload.save();

    res.json({
      success: true,
      data: {
        totalRows: upload.totalRows,
        successCount,
        failureCount,
        errors,
        credentials
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to process bulk upload' });
  }
});

module.exports = router;
