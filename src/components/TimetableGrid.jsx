// src/components/TimetableGrid.jsx
import React from 'react';

/**
 * Generates a deterministic hue (0-360) from subject name string
 * Strips '(Lab)' / '(cont.)' so lab sessions share subject color.
 */
function getSubjectHue(subjectName) {
  if (!subjectName) return 180;
  const cleanName = subjectName.replace(/\(Lab\)/gi, '').replace(/\(cont\.\)/gi, '').trim();
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

const SHORT_DAYS = [
  { full: 'Monday', short: 'Mon' },
  { full: 'Tuesday', short: 'Tue' },
  { full: 'Wednesday', short: 'Wed' },
  { full: 'Thursday', short: 'Thu' },
  { full: 'Friday', short: 'Fri' }
];

const PERIODS = [
  { id: 1, label: 'P1' },
  { id: 2, label: 'P2' },
  { id: 3, label: 'P3' },
  { id: 4, label: 'P4' },
  { id: 5, label: 'P5' },
  { id: 6, label: 'P6' }
];

export default function TimetableGrid({
  timetable,
  onMarkUnavailable,
  isFacultyView = false,
  currentFacultyId = null
}) {
  if (!timetable || !timetable.slots || timetable.slots.length === 0) {
    return (
      <div className="empty-state">
        No timetable yet. Generate one in the Scheduler dashboard first.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="timetable-table">
        <thead>
          <tr>
            <th className="period-col"></th>
            {SHORT_DAYS.map((d) => (
              <th key={d.short}>{d.short}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period.id}>
              {/* Period Label Column (P1, P2...) */}
              <td className="period-cell">{period.label}</td>

              {/* Day Columns */}
              {SHORT_DAYS.map((d) => {
                const slotData = timetable.slots.find(
                  (s) => s.day === d.full && s.slotId === period.id
                );

                if (!slotData) {
                  return <td key={d.short} style={{ background: 'transparent' }} />;
                }

                const hue = getSubjectHue(slotData.subjectName);
                const isCancelled = slotData.status === 'CANCELLED';
                const isSubstituted = slotData.isSubstituted;
                const isMyLecture = isFacultyView && slotData.facultyId === currentFacultyId;

                return (
                  <td
                    key={d.short}
                    className="filled-cell"
                    style={{
                      '--h': hue,
                      backgroundColor: `hsl(${hue}, 55%, var(--cl))`
                    }}
                  >
                    {/* Subject Name */}
                    <div className="cell-subject">{slotData.subjectName}</div>

                    {/* Faculty & Room Info */}
                    <div className="cell-meta">
                      {slotData.facultyName}
                    </div>
                    <div className="cell-meta">
                      {slotData.roomName}
                    </div>

                    {/* Substitution Note */}
                    {isSubstituted && slotData.originalFacultyName && (
                      <div className="cell-sub-note">
                        {slotData.facultyName} instead of {slotData.originalFacultyName}
                      </div>
                    )}

                    {slotData.comment && !isSubstituted && (
                      <div className="cell-sub-note">
                        {slotData.comment}
                      </div>
                    )}

                    {isCancelled && (
                      <div className="cell-sub-note" style={{ color: 'var(--bad)' }}>
                        Cancelled
                      </div>
                    )}

                    {/* Action Button inside cell ("Can't take" / "Mark Unavailable") */}
                    {isFacultyView && isMyLecture && !isCancelled && (
                      <div style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => onMarkUnavailable(timetable.id, slotData.id, slotData.facultyId)}
                        >
                          Can't take
                        </button>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
