require('dotenv').config();
const express = require('express');
const app = express();

const authRoutes = require('./features/auth/auth.routes');
const userRoutes = require('./features/users/users.routes');
const noticeRoutes = require('./features/notices/notices.routes');
const subjectRoutes = require('./features/subjects/subjects.routes');
const classroomRoutes = require('./features/classrooms/classrooms.routes');
const classRoutes = require('./features/classes/classes.routes');
const curriculumRoutes = require('./features/curriculum/curriculum.routes');
const timetableRoutes = require('./features/timetable/timetable.routes');
const hostelRoutes = require('./features/hostels/hostels.routes');
const workspaceRoutes = require('./features/workspace/workspace.routes');
const studentRoutes = require('./features/students/students.routes');
const assessmentRoutes = require('./features/assessments/assessments.routes');
const submissionRoutes = require('./features/submissions/submissions.routes');
const marksRoutes = require('./features/marks/marks.route')

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to CampusConnect Backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/marks', marksRoutes);

module.exports = app;