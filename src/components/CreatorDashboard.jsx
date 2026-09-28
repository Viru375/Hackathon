// src/components/CreatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { DEPARTMENTS, SEMESTERS } from '../../server/store.js';
import TimetableGrid from './TimetableGrid.jsx';

export default function CreatorDashboard({ facultyList, roomList, onGenerateTimetable, currentTimetables }) {
  const [collegeName, setCollegeName] = useState('Apex Institute of Technology');
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSem, setSelectedSem] = useState(4);
  const [subjectCount, setSubjectCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Data Structures & Algorithms', code: 'CS401', facultyId: '', lectureHours: 3, isLab: true, labHours: 2, lectureRoomId: 'ROOM_101', labRoomId: 'LAB_CS1' },
    { id: 2, name: 'Database Management Systems', code: 'CS402', facultyId: '', lectureHours: 3, isLab: true, labHours: 2, lectureRoomId: 'ROOM_102', labRoomId: 'LAB_CS2' },
    { id: 3, name: 'Computer Networks', code: 'CS403', facultyId: '', lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_103', labRoomId: '' },
    { id: 4, name: 'Operating Systems', code: 'CS404', facultyId: '', lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_104', labRoomId: '' },
    { id: 5, name: 'Theory of Computation', code: 'CS405', facultyId: '', lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_105', labRoomId: '' }
  ]);

  const freeFaculty = facultyList.filter((f) => f.department === selectedDept);

  useEffect(() => {
    if (freeFaculty.length > 0) {
      setSubjects((prev) =>
        prev.map((sub, idx) => ({
          ...sub,
          facultyId: freeFaculty[idx % freeFaculty.length]?.id || freeFaculty[0].id
        }))
      );
    }
  }, [selectedDept, facultyList]);

  const handleSubjectCountChange = (newCount) => {
    const count = parseInt(newCount, 10) || 1;
    setSubjectCount(count);

    if (count > subjects.length) {
      const added = [];
      for (let i = subjects.length + 1; i <= count; i++) {
        added.push({
          id: i,
          name: `Subject ${i}`,
          code: `SUB${i}0${selectedSem}`,
          facultyId: freeFaculty[(i - 1) % (freeFaculty.length || 1)]?.id || '',
          lectureHours: 3,
          isLab: false,
          labHours: 0,
          lectureRoomId: `ROOM_10${(i % 5) + 1}`,
          labRoomId: 'LAB_CS1'
        });
      }
      setSubjects([...subjects, ...added]);
    } else if (count < subjects.length) {
      setSubjects(subjects.slice(0, count));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerateTimetable({
      collegeName,
      departmentCode: selectedDept,
      semester: selectedSem,
      subjects
    });
    setIsGenerating(false);
  };

  const activeTimetable = currentTimetables.find(
    (t) => t.departmentCode === selectedDept && parseInt(t.semester, 10) === parseInt(selectedSem, 10)
  ) || currentTimetables[0];

  const totalSlotsCount = activeTimetable ? activeTimetable.slots.length : 0;
  const clashesCount = activeTimetable && activeTimetable.conflicts ? activeTimetable.conflicts.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Scheduler Configuration Card */}
      <section className="section-card">
        <h2 className="section-title">Scheduler configuration</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Department</label>
            <span className="helper-text">Select department for scheduling</span>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.code}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Semester</label>
            <span className="helper-text">Student semester level</span>
            <select value={selectedSem} onChange={(e) => setSelectedSem(parseInt(e.target.value, 10))}>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Subjects count</label>
            <span className="helper-text">Number of subjects to schedule</span>
            <input
              type="number"
              min="1"
              max="10"
              value={subjectCount}
              onChange={(e) => handleSubjectCountChange(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button type="button" className="btn-primary" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate timetable'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleGenerate()}
          >
            Load sample data
          </button>
        </div>
      </section>

      {/* Result Section */}
      <section className="section-card">
        <h2 className="section-title">Result</h2>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value good">{totalSlotsCount}/{totalSlotsCount || 30}</div>
            <div className="stat-label">sessions placed</div>
          </div>

          <div className="stat-item">
            <div className={`stat-value ${clashesCount > 0 ? 'bad' : 'good'}`}>{clashesCount}</div>
            <div className="stat-label">clashes</div>
          </div>

          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--fg)' }}>{currentTimetables.length || 1}</div>
            <div className="stat-label">classes</div>
          </div>

          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--fg)' }}>{freeFaculty.length}</div>
            <div className="stat-label">faculty</div>
          </div>
        </div>

        {/* Preview Class Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '180px' }}>
            <label>Preview class</label>
            <select
              value={activeTimetable ? activeTimetable.batchName : `${selectedDept}-Sem${selectedSem}`}
              onChange={(e) => {
                const parts = e.target.value.split('-Sem');
                if (parts.length === 2) {
                  setSelectedDept(parts[0]);
                  setSelectedSem(parseInt(parts[1], 10));
                }
              }}
            >
              {currentTimetables.map((t) => (
                <option key={t.id} value={t.batchName}>{t.batchName}</option>
              ))}
              <option value={`${selectedDept}-Sem${selectedSem}`}>{selectedDept}-Sem{selectedSem}</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-secondary"
            style={{ marginTop: 'auto' }}
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>

        {/* Conflicts Warning Note */}
        {activeTimetable && activeTimetable.conflicts && activeTimetable.conflicts.length > 0 && (
          <div className="feedback-note">
            <strong>Scheduling note:</strong> {activeTimetable.conflicts[0].issue}
          </div>
        )}

        {/* Timetable Grid */}
        <TimetableGrid timetable={activeTimetable} />
      </section>

    </div>
  );
}
