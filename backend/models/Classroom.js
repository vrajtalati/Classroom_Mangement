const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  daysOfWeek: [{ type: String, required: true }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  timetable: [{
    subject: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  }]
});

module.exports = mongoose.model('Classroom', classroomSchema);
