// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import CreatorDashboard from './components/CreatorDashboard.jsx';
import FacultyDashboard from './components/FacultyDashboard.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import LoginModal from './components/LoginModal.jsx';
import { generateInitialFaculty, generateInitialRooms } from '../server/store.js';

export default function App() {
  const [activeRole, setActiveRole] = useState('CREATOR');
  const [currentUser, setCurrentUser] = useState({ id: 'CREATOR_01', name: 'Dr. Dean (Creator)', role: 'CREATOR' });
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [facultyList, setFacultyList] = useState(generateInitialFaculty());
  const [roomList, setRoomList] = useState(generateInitialRooms());
  const [timetables, setTimetables] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch initial data from Express API
  const fetchBootstrapData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/data/bootstrap');
      if (res.ok) {
        const data = await res.json();
        if (data.faculty) setFacultyList(data.faculty);
        if (data.rooms) setRoomList(data.rooms);
        if (data.timetables) setTimetables(data.timetables);
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Backend server not connected yet, using local store fallback.', err);
    }
  };

  useEffect(() => {
    fetchBootstrapData();
  }, []);

  // Pre-generate initial demo timetable for CSE Semester 4 on boot if empty
  useEffect(() => {
    if (timetables.length === 0 && facultyList.length > 0) {
      handleGenerateTimetable({
        collegeName: 'Apex Institute of Technology',
        departmentCode: 'CSE',
        semester: 4,
        subjects: [
          { id: 1, name: 'Data Structures & Algorithms', code: 'CS401', facultyId: facultyList[0].id, lectureHours: 3, isLab: true, labHours: 2, lectureRoomId: 'ROOM_101', labRoomId: 'LAB_CS1' },
          { id: 2, name: 'Database Management Systems', code: 'CS402', facultyId: facultyList[1].id, lectureHours: 3, isLab: true, labHours: 2, lectureRoomId: 'ROOM_102', labRoomId: 'LAB_CS2' },
          { id: 3, name: 'Computer Networks', code: 'CS403', facultyId: facultyList[2].id, lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_103', labRoomId: '' },
          { id: 4, name: 'Operating Systems', code: 'CS404', facultyId: facultyList[3].id, lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_104', labRoomId: '' },
          { id: 5, name: 'Theory of Computation', code: 'CS405', facultyId: facultyList[4].id, lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_105', labRoomId: '' }
        ]
      });
    }
  }, [facultyList]);

  // Handle Timetable Generation
  const handleGenerateTimetable = async (payload) => {
    try {
      const res = await fetch('http://localhost:5000/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchBootstrapData();
        }
      }
    } catch (err) {
      console.error('Failed to connect to backend generate endpoint:', err);
    }
  };

  // Handle Faculty Mark Unavailable (triggers 4-point substitute algorithm)
  const handleMarkUnavailable = async (payload) => {
    try {
      const res = await fetch('http://localhost:5000/api/faculty/mark-unavailable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchBootstrapData();
        return data;
      }
    } catch (err) {
      console.error('Failed to submit faculty unavailability:', err);
    }
    return { success: false, message: 'Server communication error.' };
  };

  // Handle Demo Reset
  const handleResetDemo = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        await fetchBootstrapData();
      }
    } catch (err) {
      console.error('Failed to reset demo dataset:', err);
    }
  };

  // Handle Login Success
  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    setActiveRole(userObj.role);
    setIsLoginOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar with Role Switching & Login Trigger */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        notifications={notifications}
        onResetDemo={handleResetDemo}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        facultyList={facultyList}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Login & Signup Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        facultyList={facultyList}
      />

      {/* Main Container */}
      <main style={{ flex: 1, padding: '0 28px 40px 28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        
        {/* Role 1: Creator Dashboard */}
        {activeRole === 'CREATOR' && (
          <CreatorDashboard
            facultyList={facultyList}
            roomList={roomList}
            onGenerateTimetable={handleGenerateTimetable}
            currentTimetables={timetables}
          />
        )}

        {/* Role 2: Faculty Dashboard */}
        {activeRole === 'FACULTY' && (
          <FacultyDashboard
            currentFaculty={currentUser}
            facultyList={facultyList}
            timetables={timetables}
            onMarkUnavailable={handleMarkUnavailable}
          />
        )}

        {/* Role 3: Student Dashboard */}
        {activeRole === 'STUDENT' && (
          <StudentDashboard
            timetables={timetables}
            notifications={notifications}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)' }}>
        Smart Timetable Scheduler • Mon–Fri (10:30 AM – 05:30 PM) • MERN Stack & Vite for Hackathon PS-02
      </footer>
    </div>
  );
}
