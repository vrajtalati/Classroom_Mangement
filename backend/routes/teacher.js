const express = require('express');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const router = express.Router();

// Middleware to ensure the user is a teacher
const authMiddleware = require('../middleware/auth');
router.use(authMiddleware('teacher'));

// Get students in the teacher's classroom
router.get('/classroom/students', async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ teacherId: req.user._id }).populate('studentIds');
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    
    res.json(classroom.studentIds);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
});

// Update student details
router.put('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });

    res.json({ message: 'Student updated successfully', updatedStudent });
  } catch (err) {
    res.status(500).json({ message: 'Error updating student', error: err.message });
  }
});

// Delete a student from the classroom
router.delete('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const classroom = await Classroom.findOne({ teacherId: req.user._id });
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    classroom.studentIds.pull(student._id);
    await classroom.save();
    await User.findByIdAndDelete(id);

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
});

// Create or update the timetable for the classroom
router.post('/classroom/timetable', async (req, res) => {
  try {
    const { timetable } = req.body;
    const classroom = await Classroom.findOne({ teacherId: req.user._id });
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    // Check for timetable conflicts
    for (let i = 0; i < timetable.length; i++) {
      const { day, startTime, endTime } = timetable[i];
      for (let j = 0; j < classroom.timetable.length; j++) {
        const existingSession = classroom.timetable[j];
        if (
          existingSession.day === day &&
          ((startTime >= existingSession.startTime && startTime < existingSession.endTime) ||
            (endTime > existingSession.startTime && endTime <= existingSession.endTime))
        ) {
          return res.status(400).json({ message: 'Time conflict detected with existing timetable' });
        }
      }
    }

    // If no conflicts, update the timetable
    classroom.timetable = timetable;
    await classroom.save();

    res.json({ message: 'Timetable updated successfully', timetable: classroom.timetable });
  } catch (err) {
    res.status(500).json({ message: 'Error updating timetable', error: err.message });
  }
});

module.exports = router;
