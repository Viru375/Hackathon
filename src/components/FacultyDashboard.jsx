// src/components/FacultyDashboard.jsx
import React, { useState } from 'react';
import { UserCheck, AlertOctagon, CheckCircle2, Clock, MessageSquare, AlertTriangle, ShieldAlert } from 'lucide-react';
import TimetableGrid from './TimetableGrid.jsx';

export default function FacultyDashboard({ currentFaculty, facultyList, timetables, onMarkUnavailable }) {
  const [selectedFacultyId, setSelectedFacultyId] = useState(currentFaculty?.id || (facultyList[0] ? facultyList[0].id : ''));
  const [modalData, setModalData] = useState(null); // { timetableId, slotId, originalFacultyId }
  const [unavailReason, setUnavailReason] = useState('Medical Leave / Official Duty');
  const [lastActionResult, setLastActionResult] = useState(null);

  const activeFaculty = facultyList.find((f) => f.id === selectedFacultyId) || currentFaculty;

  // Filter timetables to only include slots for this specific faculty member (Flow 4 Requirement)
  const filteredTimetables = timetables.map((tt) => {
    const facultySlots = tt.slots.filter((s) => s.facultyId === selectedFacultyId);
    return {
      ...tt,
      slots: facultySlots
    };
  }).filter((tt) => tt.slots.length > 0);

  const handleOpenUnavailableModal = (timetableId, slotId, facultyId) => {
    setModalData({ timetableId, slotId, originalFacultyId: facultyId });
    setLastActionResult(null);
  };

  const handleConfirmUnavailable = async () => {
    if (!modalData) return;
    const res = await onMarkUnavailable({
      timetableId: modalData.timetableId,
      slotId: modalData.slotId,
      originalFacultyId: modalData.originalFacultyId,
      reason: unavailReason
    });
    setLastActionResult(res);
    setModalData(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Faculty Selector Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={22} color="var(--primary)" /> Faculty Portal: My Assigned Schedule
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing lectures strictly assigned to <strong>{activeFaculty?.name}</strong>. Other classes are hidden.
            </p>
          </div>

          {/* Faculty Switcher (Demo selector) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Switch Faculty Demo:</span>
            <select
              value={selectedFacultyId}
              onChange={(e) => {
                setSelectedFacultyId(e.target.value);
                setLastActionResult(null);
              }}
              style={{ minWidth: '220px' }}
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {lastActionResult && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '16px',
          borderLeft: lastActionResult.status === 'SUBSTITUTED' ? '4px solid var(--warning)' : '4px solid var(--accent)',
          background: 'rgba(15, 23, 42, 0.9)'
        }}>
          <h4 style={{ color: lastActionResult.status === 'SUBSTITUTED' ? 'var(--warning)' : 'var(--accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {lastActionResult.status === 'SUBSTITUTED' ? <CheckCircle2 size={18} /> : <AlertOctagon size={18} />}
            {lastActionResult.message}
          </h4>
          {lastActionResult.comment && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Time-tracked Comment: <strong>{lastActionResult.comment}</strong>
            </p>
          )}
        </div>
      )}

      {/* Timetables List */}
      {filteredTimetables.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Clock size={36} color="var(--primary)" style={{ marginBottom: '10px' }} />
          <h3 style={{ color: '#fff' }}>No Lectures Scheduled</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            No active lectures found for {activeFaculty?.name} in the current timetables.
          </p>
        </div>
      ) : (
        filteredTimetables.map((tt) => (
          <div key={tt.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TimetableGrid
              timetable={tt}
              isFacultyView={true}
              currentFacultyId={selectedFacultyId}
              onMarkUnavailable={handleOpenUnavailableModal}
            />
          </div>
        ))
      )}

      {/* Mark Unavailable Modal */}
      {modalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '440px', padding: '24px' }}>
            <h3 style={{ color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle color="var(--accent)" size={20} /> Mark Lecture Unavailable
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              The system will automatically run <strong>4 checks across 50 faculty members</strong> to find a substitute. If no substitute is available, the lecture will be marked as CANCELLED with time-tracked comment.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Reason for Unavailability</label>
              <input
                type="text"
                value={unavailReason}
                onChange={(e) => setUnavailReason(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setModalData(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleConfirmUnavailable}>
                Run Substitute Algorithm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
