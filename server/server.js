// server/server.js
// Express API Backend for Smart Timetable & Classroom Scheduler

import express from 'express';
import cors from 'cors';
import { db, DEPARTMENTS, SEMESTERS, TIME_SLOTS, DAYS, generateInitialFaculty, generateInitialRooms } from './store.js';
import { generateConflictFreeTimetable } from './solver.js';
import { processFacultyUnavailability } from './substituteFinder.js';

const app = express();
const PORT = process.env.PORT || 5000;

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

// Demo Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;

  if (role === 'CREATOR') {
    if (username === 'creator' || username === 'creator@college.edu') {
      return res.json({
        success: true,
        user: { id: 'CREATOR_01', name: 'Dr. Dean (Creator)', role: 'CREATOR', department: 'ALL' }
      });
    }
  } else if (role === 'FACULTY') {
    const facultyUser = db.faculty.find((f) => f.username === username || f.email === username);
    if (facultyUser) {
      return res.json({
        success: true,
        user: { id: facultyUser.id, name: facultyUser.name, role: 'FACULTY', department: facultyUser.department, email: facultyUser.email }
      });
    }
    // Fallback to first faculty if demo click
    const demoFaculty = db.faculty[0];
    return res.json({
      success: true,
      user: { id: demoFaculty.id, name: demoFaculty.name, role: 'FACULTY', department: demoFaculty.department, email: demoFaculty.email }
    });
  } else if (role === 'STUDENT') {
    return res.json({
      success: true,
      user: {
        id: 'STUDENT_01',
        name: 'Rahul Kumar (Student)',
        role: 'STUDENT',
        department: 'CSE',
        semester: 4,
        batchName: 'CSE-Sem4'
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Fetch Available Free Faculty for Creator Wizard
app.get('/api/faculty/free', (req, res) => {
  const { departmentCode } = req.query;
  const filtered = departmentCode
    ? db.faculty.filter((f) => f.department === departmentCode)
    : db.faculty;

  res.json({ success: true, count: filtered.length, faculty: filtered });
});

// Generate Timetable (Creator Action)
app.post('/api/timetable/generate', (req, res) => {
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
app.get('/api/timetable/all', (req, res) => {
  res.json({ success: true, timetables: db.timetables });
});

// Get Student Timetable View (Filtered by Dept & Semester)
app.get('/api/timetable/student', (req, res) => {
  const { departmentCode, semester } = req.query;
  const semNum = parseInt(semester || 4, 10);
  const dept = departmentCode || 'CSE';

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
app.get('/api/timetable/faculty/:facultyId', (req, res) => {
  const { facultyId } = req.params;
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
app.post('/api/faculty/mark-unavailable', (req, res) => {
  const { timetableId, slotId, originalFacultyId, reason } = req.body;

  if (!timetableId || !slotId || !originalFacultyId) {
    return res.status(400).json({ success: false, message: 'Missing parameters.' });
  }

  const result = processFacultyUnavailability({ timetableId, slotId, originalFacultyId, reason });
  res.json(result);
});

// Save Faculty Free / Preference Slots
app.post('/api/faculty/preferences', (req, res) => {
  const { facultyId, unavailability } = req.body;
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
app.post('/api/seed/reset', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`✅ Smart Timetable Express Server running on port ${PORT}`);
});
