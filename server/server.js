// server/server.js
// Express API Backend for Smart Timetable & Classroom Scheduler

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { db, DEPARTMENTS, SEMESTERS, TIME_SLOTS, DAYS, generateInitialFaculty, generateInitialRooms } from './store.js';
import { generateConflictFreeTimetable } from './solver.js';
import { processFacultyUnavailability } from './substituteFinder.js';
import User from './User.js';
import { requireAuth, requireRole } from './authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'Smart Timetable & Classroom Scheduler MERN Engine is running.',
    facultyCount: db.faculty.length,
    timetableCount: db.timetables.length,
    timestamp: new Date().toLocaleString()
  });
});

const tokenSecret = () => process.env.JWT_SECRET || 'local-development-secret-change-me';
const publicUser = (user) => ({
  id: user.linkedId,
  name: user.name,
  username: user.username,
  role: user.role,
  department: user.department,
  semester: user.semester,
  batchName: user.batchName
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username?.trim() || !password || !['CREATOR', 'FACULTY', 'STUDENT'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Choose a role and enter your username and password.' });
  }

  try {
    const user = await User.findOne({ username: username.trim().toLowerCase(), role });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Incorrect username, password, or account type.' });
    }
    const token = jwt.sign({ sub: user.id }, tokenSecret(), { expiresIn: '12h' });
    return res.json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Unable to sign in right now.' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, password, name, role, department, semester } = req.body || {};
  if (!username?.trim() || !password || !name?.trim() || !['CREATOR', 'FACULTY', 'STUDENT'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Complete all required account fields.' });
  }
  if (role !== 'STUDENT') {
    return res.status(403).json({ success: false, message: 'Self-service registration is available for student accounts only.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    if (await User.exists({ username: normalizedUsername })) {
      return res.status(409).json({ success: false, message: 'That username is already registered.' });
    }
    const user = await User.create({
      username: normalizedUsername,
      passwordHash: await bcrypt.hash(password, 10),
      name: name.trim(),
      role,
      linkedId: role === 'CREATOR' ? `CREATOR_${Date.now()}` : role === 'FACULTY' ? `FAC_${Date.now()}` : `STUDENT_${Date.now()}`,
      department: role === 'CREATOR' ? 'ALL' : department || 'CSE',
      semester: role === 'STUDENT' ? Number(semester || 4) : undefined,
      batchName: role === 'STUDENT' ? `${department || 'CSE'}-Sem${Number(semester || 4)}` : undefined
    });
    const token = jwt.sign({ sub: user.id }, tokenSecret(), { expiresIn: '12h' });
    return res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'That username is already registered.' });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Unable to create your account right now.' });
  }
});

app.use('/api', requireAuth);

app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// Bootstrap Demo Data
app.get('/api/data/bootstrap', (req, res) => {
  res.json({
    departments: DEPARTMENTS,
    semesters: SEMESTERS,
    timeSlots: TIME_SLOTS,
    days: DAYS,
    faculty: db.faculty,
    rooms: db.rooms,
    timetables: db.timetables,
    notifications: db.notifications,
    auditLogs: db.auditLogs
  });
});

// Fetch Available Free Faculty for Creator Wizard
app.get('/api/faculty/free', requireRole('CREATOR'), (req, res) => {
  const { departmentCode } = req.query;
  const filtered = departmentCode
    ? db.faculty.filter((f) => f.department === departmentCode)
    : db.faculty;

  res.json({ success: true, count: filtered.length, faculty: filtered });
});

// Generate Timetable (Creator Action)
app.post('/api/timetable/generate', requireRole('CREATOR'), (req, res) => {
  try {
    const { collegeName, departmentCode, semester, subjects } = req.body;

    if (!departmentCode || !semester || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required inputs (Department, Semester, Subjects)' });
    }

    const timetable = generateConflictFreeTimetable({ collegeName, departmentCode, semester, subjects });
    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Timetable Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate timetable.', error: error.message });
  }
});

// Get All Timetables
app.get('/api/timetable/all', requireRole('CREATOR'), (req, res) => {
  res.json({ success: true, timetables: db.timetables });
});

// Get Student Timetable View (Filtered by Dept & Semester)
app.get('/api/timetable/student', requireRole('STUDENT', 'CREATOR'), (req, res) => {
  const { departmentCode, semester } = req.query;
  const semNum = parseInt(semester || 4, 10);
  const dept = departmentCode || 'CSE';
  if (req.user.role === 'STUDENT' && (req.user.department !== dept || req.user.semester !== semNum)) {
    return res.status(403).json({ success: false, message: 'You can only view your own department and semester.' });
  }

  const timetable = db.timetables.find((t) => t.departmentCode === dept && parseInt(t.semester, 10) === semNum);

  res.json({
    success: true,
    departmentCode: dept,
    semester: semNum,
    timetable: timetable || null,
    message: timetable ? 'Timetable found' : 'No timetable generated yet for this semester.'
  });
});

// Get Faculty Specific Timetable View (Hides other classes - Image 4 Requirement)
app.get('/api/timetable/faculty/:facultyId', requireRole('FACULTY', 'CREATOR'), (req, res) => {
  const { facultyId } = req.params;
  if (req.user.role === 'FACULTY' && req.user.linkedId !== facultyId) {
    return res.status(403).json({ success: false, message: 'You can only view your own timetable.' });
  }
  const facultyMember = db.faculty.find((f) => f.id === facultyId);

  const facultyLectures = [];
  db.timetables.forEach((tt) => {
    tt.slots.forEach((slot) => {
      if (slot.facultyId === facultyId) {
        facultyLectures.push({
          ...slot,
          timetableId: tt.id,
          departmentCode: tt.departmentCode,
          semester: tt.semester
        });
      }
    });
  });

  res.json({
    success: true,
    faculty: facultyMember || null,
    lectures: facultyLectures
  });
});

// Mark Faculty Lecture Unavailable & Auto-Assign Substitute (Image 4 Algorithm)
app.post('/api/faculty/mark-unavailable', requireRole('FACULTY'), (req, res) => {
  const { timetableId, slotId, originalFacultyId, reason } = req.body;

  if (!timetableId || !slotId || !originalFacultyId) {
    return res.status(400).json({ success: false, message: 'Missing parameters.' });
  }
  if (req.user.linkedId !== originalFacultyId) {
    return res.status(403).json({ success: false, message: 'You can only update your own availability.' });
  }

  const result = processFacultyUnavailability({ timetableId, slotId, originalFacultyId, reason });
  res.json(result);
});

// Save Faculty Free / Preference Slots
app.post('/api/faculty/preferences', requireRole('FACULTY'), (req, res) => {
  const { facultyId, unavailability } = req.body;
  if (req.user.linkedId !== facultyId) {
    return res.status(403).json({ success: false, message: 'You can only update your own preferences.' });
  }
  const faculty = db.faculty.find((f) => f.id === facultyId);

  if (faculty) {
    faculty.unavailability = unavailability || [];
    res.json({ success: true, message: 'Faculty preferences updated successfully.' });
  } else {
    res.status(404).json({ success: false, message: 'Faculty not found.' });
  }
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, notifications: db.notifications });
});

// Reset Dataset Endpoint
app.post('/api/seed/reset', requireRole('CREATOR'), (req, res) => {
  db.faculty = generateInitialFaculty();
  db.rooms = generateInitialRooms();
  db.timetables = [];
  db.notifications = [
    {
      id: 'NOTIF_RESET',
      recipientType: 'ALL',
      message: 'Database reset to fresh pre-seeded state (50 Faculty & 5 Branches).',
      timestamp: new Date().toLocaleString(),
      read: false
    }
  ];
  db.auditLogs = [];

  res.json({ success: true, message: 'Database reset successfully.', facultyCount: db.faculty.length });
});

async function seedDemoUsers() {
  const faculty = db.faculty[0];
  const demos = [
    { username: 'creator', password: 'creator123', name: 'Dr. Dean (Creator)', role: 'CREATOR', linkedId: 'CREATOR_01', department: 'ALL' },
    { username: 'faculty', password: 'faculty123', name: faculty.name, role: 'FACULTY', linkedId: faculty.id, department: faculty.department },
    { username: 'student', password: 'student123', name: 'Rahul Kumar (Student)', role: 'STUDENT', linkedId: 'STUDENT_01', department: 'CSE', semester: 4, batchName: 'CSE-Sem4' }
  ];

  for (const demo of demos) {
    if (!(await User.exists({ username: demo.username }))) {
      await User.create({
        ...demo,
        passwordHash: await bcrypt.hash(demo.password, 10)
      });
    }
  }
}

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/timetable_scheduler');
    await seedDemoUsers();
    app.listen(PORT, () => {
      console.log(`Smart Timetable API running on port ${PORT}`);
      console.log('MongoDB connected; demo accounts are ready.');
    });
  } catch (error) {
    console.error('Could not start API. Ensure local MongoDB is running and MONGODB_URI is correct.', error);
    process.exitCode = 1;
  }
}

startServer();
