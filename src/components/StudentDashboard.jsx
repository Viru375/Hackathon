// src/components/StudentDashboard.jsx
import React, { useState } from 'react';
import { DEPARTMENTS, SEMESTERS } from '../../server/store.js';
import TimetableGrid from './TimetableGrid.jsx';

export default function StudentDashboard({ timetables, notifications }) {
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSem, setSelectedSem] = useState(4);
  const [selectedBatch, setSelectedBatch] = useState('A');

  const activeTimetable = timetables.find(
    (t) => t.departmentCode === selectedDept && parseInt(t.semester, 10) === parseInt(selectedSem, 10)
  ) || timetables[0];

  const batchName = `${selectedDept}-Sem${selectedSem}`;

  const batchNotifications = notifications.filter(
    (n) => n.recipientType === 'ALL' || n.targetBatch === batchName
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section className="section-card">
        <h2 className="section-title">Student dashboard</h2>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="form-group">
            <label>Department</label>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.code}>{dept.code}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Semester</label>
            <select value={selectedSem} onChange={(e) => setSelectedSem(parseInt(e.target.value, 10))}>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Batch</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>

        {/* Live Notification Feedback Note */}
        {batchNotifications.length > 0 && (
          <div className="feedback-note">
            <strong>Update note:</strong> {batchNotifications[0].message}
          </div>
        )}

        {/* Timetable Grid */}
        <TimetableGrid timetable={activeTimetable} />
      </section>
    </div>
  );
}
