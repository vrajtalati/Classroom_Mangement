const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const principalRoutes = require('./routes/principal');
const teacherRoutes = require('./routes/teacher');
// const studentRoutes = require('./routes/student');
const authMiddleware = require('./middleware/auth');

// Load environment variables
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Use the MongoDB URI from the .env file
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/principal', principalRoutes);
app.use('/api/teacher', teacherRoutes);
// app.use('/api/student', authMiddleware('student'), studentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
