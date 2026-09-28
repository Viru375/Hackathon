// src/components/FacultyDashboard.jsx
import React, { useState } from 'react';
import TimetableGrid from './TimetableGrid.jsx';

export default function FacultyDashboard({ currentFaculty, facultyList, timetables, onMarkUnavailable }) {
  const [selectedFacultyId, setSelectedFacultyId] = useState(currentFaculty?.id || (facultyList[0] ? facultyList[0].id : ''));

  const activeFaculty = facultyList.find((f) => f.id === selectedFacultyId) || currentFaculty;

  // Filter timetables for selected faculty
  const filteredTimetables = timetables.map((tt) => {
    const facultySlots = tt.slots.filter((s) => s.facultyId === selectedFacultyId);
    return {
      ...tt,
      slots: facultySlots
    };
  }).filter((tt) => tt.slots.length > 0);

  const activeTimetable = filteredTimetables[0] || (timetables[0] ? { ...timetables[0], slots: timetables[0].slots.filter((s) => s.facultyId === selectedFacultyId) } : null);

  const handleMarkUnavailable = (timetableId, slotId, facultyId) => {
    onMarkUnavailable({
      timetableId,
      slotId,
      originalFacultyId: facultyId,
      reason: 'Faculty duty update'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section className="section-card">
        <h2 className="section-title">Faculty dashboard</h2>

        <div className="form-group" style={{ maxWidth: '280px' }}>
          <label>Log in as</label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--mut)', lineHeight: 1.4 }}>
          Can't take a lecture? Press the button on that lecture. A free faculty member is assigned for the next date that weekday comes around, and the students see the change.
        </p>

        {activeTimetable ? (
          <TimetableGrid
            timetable={activeTimetable}
            isFacultyView={true}
            currentFacultyId={selectedFacultyId}
            onMarkUnavailable={handleMarkUnavailable}
          />
        ) : (
          <div className="empty-state">
            No lectures scheduled for {activeFaculty?.name}.
          </div>
        )}
      </section>
    </div>
  );
}
