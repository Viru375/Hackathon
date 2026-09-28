// src/components/StudentDashboard.jsx
import React, { useState } from 'react';
import { DEPARTMENTS, SEMESTERS } from '../../server/store.js';
import { GraduationCap, Bell, AlertTriangle, CheckCircle, Info, BookOpen } from 'lucide-react';
import TimetableGrid from './TimetableGrid.jsx';

export default function StudentDashboard({ timetables, notifications }) {
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSem, setSelectedSem] = useState(4);

  // Filter student timetable
  const activeTimetable = timetables.find(
    (t) => t.departmentCode === selectedDept && parseInt(t.semester, 10) === parseInt(selectedSem, 10)
  );

  const batchName = `${selectedDept}-Sem${selectedSem}`;

  // Filter student notifications for this batch
  const batchNotifications = notifications.filter(
    (n) => n.recipientType === 'ALL' || n.targetBatch === batchName
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Student Filter Selection (Image 3 Flow) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={22} color="var(--primary)" /> Student Portal: View Class Timetable
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Department / Branch</label>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ width: '100%' }}>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.code}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Semester</label>
            <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} style={{ width: '100%' }}>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>Semester {sem} ({sem >= 7 ? '4th Year' : sem >= 5 ? '3rd Year' : sem >= 3 ? '2nd Year' : '1st Year'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Target Batch</label>
            <input
              type="text"
              readOnly
              value={batchName}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--secondary)', fontWeight: 700 }}
            />
          </div>
        </div>
      </div>

      {/* Live Notifications Feed for Student */}
      {batchNotifications.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--secondary)' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--secondary)" /> Live Updates for {batchName}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {batchNotifications.map((notif) => (
              <div key={notif.id} style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-glass)',
                fontSize: '0.84rem'
              }}>
                <p style={{ margin: 0, color: 'var(--text-primary)' }}>{notif.message}</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{notif.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      {activeTimetable ? (
        <TimetableGrid timetable={activeTimetable} />
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <BookOpen size={40} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <h3 style={{ color: '#fff' }}>No Timetable Published Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            The Creator has not generated a timetable for {batchName} yet. Please switch to Creator Dashboard to generate one!
          </p>
        </div>
      )}
    </div>
  );
}
