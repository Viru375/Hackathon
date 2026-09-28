// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Calendar, UserCheck, GraduationCap, ShieldAlert, Bell, RefreshCw, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, notifications, onResetDemo, currentUser, setCurrentUser, facultyList, onOpenLogin }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="glass-panel no-print" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-glass)', padding: '14px 28px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '10px', borderRadius: '12px', display: 'flex', color: '#fff' }}>
            <Calendar size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>Smart Timetable Scheduler</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mon–Fri • 10:30 AM–05:30 PM • 45m Lunch & 15m Tea Break</p>
          </div>
        </div>

        {/* Role Selector Tabs (Creator, Faculty, Student) */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <button
            className={`role-btn ${activeRole === 'CREATOR' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveRole('CREATOR');
              setCurrentUser({ id: 'CREATOR_01', name: 'Dr. Dean (Creator)', role: 'CREATOR' });
            }}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <ShieldAlert size={16} /> Creator
          </button>

          <button
            className={`role-btn ${activeRole === 'FACULTY' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveRole('FACULTY');
              if (facultyList && facultyList.length > 0) {
                setCurrentUser({ id: facultyList[0].id, name: facultyList[0].name, role: 'FACULTY', department: facultyList[0].department });
              }
            }}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <UserCheck size={16} /> Faculty
          </button>

          <button
            className={`role-btn ${activeRole === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveRole('STUDENT');
              setCurrentUser({ id: 'STUDENT_01', name: 'Rahul Kumar', role: 'STUDENT', department: 'CSE', semester: 4 });
            }}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <GraduationCap size={16} /> Student
          </button>
        </div>

        {/* Action Controls & User Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Active User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
            <User size={14} color="var(--secondary)" />
            <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{currentUser.name}</span>
          </div>

          {/* Login / Switch Account Button */}
          <button className="btn-secondary" onClick={onOpenLogin} title="Login / Switch Account">
            <LogIn size={16} /> Sign In
          </button>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ padding: '10px', borderRadius: '50%', position: 'relative' }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="glass-panel animate-fade-in" style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '360px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 100,
                padding: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Notifications Feed</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} updates</span>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>No notifications yet.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: notif.type === 'LECTURE_CANCELLED' ? '3px solid var(--accent)' : '3px solid var(--secondary)',
                      marginBottom: '8px',
                      fontSize: '0.82rem'
                    }}>
                      <p style={{ margin: 0, color: 'var(--text-primary)' }}>{notif.message}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{notif.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button className="btn-secondary" onClick={onResetDemo} title="Reset Data to Default Demo State">
            <RefreshCw size={16} /> Reset
          </button>
        </div>
      </div>
    </header>
  );
}
