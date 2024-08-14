const express = require('express');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fetch all Teachers
router.get('/teachers', async (req, res) => {
  const teachers = await User.find({ role: 'teacher' });
  res.send(teachers);
});

// Fetch all Students
router.get('/students', async (req, res) => {
  const students = await User.find({ role: 'student' });
  res.send(students);
});

// Create Student/Teacher 
router.post('/create-user', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Check if the role is either 'teacher' or 'student'
  if (!['teacher', 'student'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specified.' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Create Classroom
router.post('/classroom', async (req, res) => {
  const { name, startTime, endTime, daysOfWeek, teacherId, studentIds, timetable } = req.body;

  // Basic validation
  if (!name || !startTime || !endTime || !daysOfWeek || !teacherId || !studentIds || !timetable) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Check if the teacher is already assigned to a classroom
    const existingClassroom = await Classroom.findOne({ teacherId });
    if (existingClassroom) {
      return res.status(400).json({ success: false, message: 'Teacher is already assigned to another classroom.' });
    }

    // Create a new classroom
    const classroom = new Classroom({
      name,
      startTime,
      endTime,
      daysOfWeek,
      teacherId,
      studentIds,
      timetable
    });

    // Save the classroom to the database
    await classroom.save();

    return res.status(201).json({
      success: true,
      message: 'Classroom created successfully.',
      classroom
    });
  } catch (error) {
    console.error('Error creating classroom:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Assign Teacher to Classroom
router.post('/assign-teacher', async (req, res) => {
  const { classroomId, teacherId } = req.body;

  try {
    // Check if the teacher is already assigned to a classroom
    const existingClassroom = await Classroom.findOne({ teacherId });
    if (existingClassroom) {
      return res.status(400).json({ success: false, message: 'Teacher is already assigned to another classroom.' });
    }

    // Assign teacher to the classroom
    const classroom = await Classroom.findByIdAndUpdate(classroomId, { teacherId }, { new: true });
    return res.status(200).json({
      success: true,
      message: 'Teacher assigned to classroom successfully.',
      classroom
    });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Delete Teacher or Student
router.delete('/:role/:id', async (req, res) => {
  const { role, id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully.`,
      user
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
