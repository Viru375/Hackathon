// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import CreatorDashboard from './components/CreatorDashboard.jsx';
import FacultyDashboard from './components/FacultyDashboard.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import LoginModal from './components/LoginModal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateInitialFaculty, generateInitialRooms } from '../server/store.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionToken, setSessionToken] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [facultyList, setFacultyList] = useState(generateInitialFaculty());
  const [roomList, setRoomList] = useState(generateInitialRooms());
  const [timetables, setTimetables] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch initial data from Express API
  const fetchBootstrapData = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/data/bootstrap`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('session_token');
      if (!savedToken) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Your session has expired.');
        setSessionToken(savedToken);
        setCurrentUser(data.user);
        await fetchBootstrapData(savedToken);
      } catch (error) {
        localStorage.removeItem('session_token');
        toast.error(error.message || 'Please sign in again.');
      } finally {
        setIsCheckingSession(false);
      }
    };

    restoreSession();
  }, []);

  // Pre-generate initial demo timetable for CSE Semester 4 on boot if empty
  useEffect(() => {
    if (currentUser?.role === 'CREATOR' && timetables.length === 0 && facultyList.length > 0) {
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
  }, [facultyList, currentUser, timetables.length]);

  // Handle Timetable Generation
  const handleGenerateTimetable = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/timetable/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchBootstrapData(sessionToken);
        } else {
          toast.error(data.message || 'Could not generate the timetable.');
        }
      } else {
        const data = await res.json();
        toast.error(data.message || 'Could not generate the timetable.');
      }
    } catch {
      toast.error('Could not connect to the timetable server.');
    }
  };

  // Handle Faculty Mark Unavailable (triggers 4-point substitute algorithm)
  const handleMarkUnavailable = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/mark-unavailable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchBootstrapData(sessionToken);
        return data;
      } else {
        const data = await res.json();
        toast.error(data.message || 'Could not update availability.');
      }
    } catch {
      toast.error('Could not connect to the timetable server.');
    }
    return { success: false, message: 'Server communication error.' };
  };

  // Handle Login Success
  const handleLoginSuccess = async (userObj, token) => {
    localStorage.setItem('session_token', token);
    setSessionToken(token);
    setCurrentUser(userObj);
    setIsLoginOpen(false);
    await fetchBootstrapData(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    setSessionToken('');
    setCurrentUser(null);
    setIsLoginOpen(false);
    setTimetables([]);
    toast.success('You have signed out.');
  };

  return (
    <div className="app-container">
      
      {/* Navbar with Role Switching & Theme Toggle */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Login & Signup Modal */}
      <LoginModal
        isOpen={!isCheckingSession && (!currentUser || isLoginOpen)}
        onClose={currentUser ? () => setIsLoginOpen(false) : null}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Main Container */}
      <main>
        {!isCheckingSession && currentUser?.role === 'CREATOR' && (
          <CreatorDashboard
            facultyList={facultyList}
            roomList={roomList}
            onGenerateTimetable={handleGenerateTimetable}
            currentTimetables={timetables}
          />
        )}

        {!isCheckingSession && currentUser?.role === 'FACULTY' && (
          <FacultyDashboard
            currentFaculty={currentUser}
            facultyList={facultyList}
            timetables={timetables}
            onMarkUnavailable={handleMarkUnavailable}
          />
        )}

        {!isCheckingSession && currentUser?.role === 'STUDENT' && (
          <StudentDashboard
            timetables={timetables}
            notifications={notifications}
          />
        )}
      </main>
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />

    </div>
  );
}
