// src/components/TimetableGrid.jsx
import React from 'react';
import { DAYS, TIME_SLOTS } from '../../server/store.js';
import { Printer, Info, Coffee, Utensils } from 'lucide-react';

export default function TimetableGrid({ timetable, onMarkUnavailable, isFacultyView = false, currentFacultyId = null }) {
  if (!timetable || !timetable.slots || timetable.slots.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <Info size={40} color="var(--primary)" style={{ marginBottom: '12px' }} />
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Timetable Available</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Please select or generate a timetable to view weekly schedule.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', overflowX: 'auto' }}>
      
      {/* Header Info */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {timetable.collegeName || 'State Engineering Institute'}
            <span className="badge badge-morning" style={{ fontSize: '0.75rem' }}>{timetable.batchName || timetable.departmentCode}</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Semester: {timetable.semester} • {timetable.yearGroup} • Mon–Fri (10:30 AM – 05:30 PM)
          </p>
        </div>

        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print / Export PDF
        </button>
      </div>

      {/* Grid Table */}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px', fontSize: '0.88rem' }}>
        <thead>
          <tr>
            <th style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '12px', borderRadius: '8px', color: 'var(--text-secondary)', textAlign: 'center', width: '130px' }}>
              Day / Time
            </th>

            {/* Slot 1 & 2 */}
            <th style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Slot 1</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>10:30 AM - 11:30 AM</div>
            </th>
            <th style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Slot 2</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>11:30 AM - 12:30 PM</div>
            </th>

            {/* 45 MIN LUNCH BREAK COLUMN */}
            <th style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px', borderRadius: '8px', color: '#fbbf24', textAlign: 'center', width: '110px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Utensils size={14} /> Lunch Break
              </div>
              <div style={{ fontSize: '0.7rem' }}>12:30 - 01:15 PM (45m)</div>
            </th>

            {/* Slot 3 & 4 */}
            <th style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Slot 3</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>01:15 PM - 02:15 PM</div>
            </th>
            <th style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Slot 4</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>02:15 PM - 03:15 PM</div>
            </th>

            {/* 15 MIN TEA BREAK COLUMN */}
            <th style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '10px', borderRadius: '8px', color: '#c084fc', textAlign: 'center', width: '100px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Coffee size={14} /> Tea Break
              </div>
              <div style={{ fontSize: '0.7rem' }}>03:15 - 03:30 PM (15m)</div>
            </th>

            {/* Slot 5 & 6 */}
            <th style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Slot 5</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>03:30 PM - 04:30 PM</div>
            </th>
            <th style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Slot 6</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>04:30 PM - 05:30 PM</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day}>
              {/* Day Header */}
              <td style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '12px', borderRadius: '8px', fontWeight: 700, color: 'var(--secondary)', textAlign: 'center' }}>
                {day}
              </td>

              {/* Render Slots 1 & 2 */}
              {[1, 2].map((slotId) => renderCell(day, slotId))}

              {/* LUNCH BREAK CELL */}
              <td style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '8px', textAlign: 'center', padding: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>🥪 Lunch</span>
              </td>

              {/* Render Slots 3 & 4 */}
              {[3, 4].map((slotId) => renderCell(day, slotId))}

              {/* TEA BREAK CELL */}
              <td style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px dashed rgba(139, 92, 246, 0.3)', borderRadius: '8px', textAlign: 'center', padding: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>☕ Break</span>
              </td>

              {/* Render Slots 5 & 6 */}
              {[5, 6].map((slotId) => renderCell(day, slotId))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function renderCell(day, slotId) {
    const slotData = timetable.slots.find((s) => s.day === day && s.slotId === slotId);

    if (!slotData) {
      return (
        <td key={slotId} style={{ background: 'rgba(15, 23, 42, 0.3)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)' }}>Free Slot</span>
        </td>
      );
    }

    const isCancelled = slotData.status === 'CANCELLED';
    const isSubstituted = slotData.isSubstituted;
    const isLab = slotData.isLab;

    const isMyLecture = isFacultyView && slotData.facultyId === currentFacultyId;

    return (
      <td key={slotId} style={{
        background: isCancelled
          ? 'rgba(244, 63, 94, 0.15)'
          : isSubstituted
          ? 'rgba(245, 158, 11, 0.15)'
          : isLab
          ? 'rgba(6, 182, 212, 0.15)'
          : 'rgba(99, 102, 241, 0.12)',
        border: isCancelled
          ? '1px solid rgba(244, 63, 94, 0.4)'
          : isSubstituted
          ? '1px solid rgba(245, 158, 11, 0.4)'
          : isLab
          ? '1px solid rgba(6, 182, 212, 0.3)'
          : '1px solid var(--border-glass)',
        borderRadius: '8px',
        padding: '10px',
        verticalAlign: 'top',
        position: 'relative'
      }}>
        {/* Subject Title */}
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isCancelled ? '#fda4af' : '#fff', marginBottom: '4px' }}>
          {slotData.subjectName}
        </div>

        {/* Room Badge */}
        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🏫 {slotData.roomName}</span>
          {isLab && <span className="badge badge-lab" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>LAB</span>}
        </div>

        {/* Faculty Name */}
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          👤 {slotData.facultyName}
          {slotData.originalFacultyName && (
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--warning)', fontStyle: 'italic' }}>
              (Sub for {slotData.originalFacultyName})
            </span>
          )}
        </div>

        {/* Time-tracked comment */}
        {slotData.comment && (
          <div style={{ marginTop: '6px', fontSize: '0.68rem', color: isCancelled ? '#f43f5e' : '#f59e0b', background: 'rgba(0,0,0,0.3)', padding: '4px 6px', borderRadius: '4px' }}>
            💬 {slotData.comment}
          </div>
        )}

        {/* Cancelled badge */}
        {isCancelled && (
          <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#f43f5e', fontWeight: 700 }}>
            ❌ CANCELLED
          </div>
        )}

        {/* Faculty Action: Mark Unavailable */}
        {isFacultyView && isMyLecture && !isCancelled && (
          <button
            className="no-print"
            onClick={() => onMarkUnavailable(timetable.id, slotData.id, slotData.facultyId)}
            style={{
              marginTop: '8px',
              width: '100%',
              fontSize: '0.72rem',
              padding: '4px 8px',
              background: 'rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '4px'
            }}
          >
            🚫 Mark Unavailable
          </button>
        )}
      </td>
    );
  }
}
