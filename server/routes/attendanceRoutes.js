// routes/attendance.js
const express = require("express");
const Attendance = require("../models/Attendance");
const Event = require("../models/Schedule");
const Team = require("../models/Team");
const router = express.Router();

// Get attendance for a specific event
router.get('/byEvent/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find attendance record for this event
    const attendance = await Attendance.findOne({ event: eventId })
      .populate('team', '_id name')
      .populate('present', '_id name image gender')
      .populate('absent', '_id name image gender');

    if (attendance) {
      // If attendance exists, return it
      return res.json({
        success: true,
        data: {
          _id: attendance._id,
          team: attendance.team,
          members: [...attendance.present, ...attendance.absent],
          present: attendance.present,
          absent: attendance.absent,
          isExisting: true
        }
      });
    }

    // If no attendance record exists, get team members from the event's team
    const event = await Event.findById(eventId).populate('team');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const team = await Team.findById(event.team).populate('members', '_id name image gender');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.json({
      success: true,
      data: {
        team: team._id,
        members: team.members,
        isExisting: false
      }
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create or update attendance
router.post('/', async (req, res) => {
  try {
    const { present, teamId, eventId } = req.body;

    // Validate required fields
    if (!present || !teamId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: present, teamId, eventId'
      });
    }

    // Get team to find all members
    const team = await Team.findById(teamId).populate('members');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const allMemberIds = team.members.map(member => member._id);
    const presentIds = Array.isArray(present) ? present : [present];
    
    // Calculate absent members (all members not in present list)
    const absentIds = allMemberIds.filter(
      memberId => !presentIds.includes(memberId.toString())
    );

    // Find existing attendance or create new one
    const attendance = await Attendance.findOneAndUpdate(
      { team: teamId, event: eventId },
      {
        team: teamId,
        event: eventId,
        present: presentIds,
        absent: absentIds
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    ).populate('present', 'name image gender')
     .populate('absent', 'name image gender');

    res.json({
      success: true,
      message: 'Attendance saved successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Error saving attendance:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this team and event'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get attendance records for a team
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const attendanceRecords = await Attendance.find({ team: teamId })
      .populate('event', 'name date')
      .populate('present', 'name')
      .populate('absent', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: attendanceRecords
    });

  } catch (error) {
    console.error('Error fetching team attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get specific attendance record
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findById(id)
      .populate('team', 'name')
      .populate('event', 'name date')
      .populate('present', 'name image gender')
      .populate('absent', 'name image gender');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
