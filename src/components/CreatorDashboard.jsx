// src/components/CreatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { DEPARTMENTS, SEMESTERS } from '../../server/store.js';
import { Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, Building2, BookOpen, Users, Clock, DoorOpen, Calendar } from 'lucide-react';
import TimetableGrid from './TimetableGrid.jsx';

export default function CreatorDashboard({ facultyList, roomList, onGenerateTimetable, currentTimetables }) {
  const [collegeName, setCollegeName] = useState('Apex Institute of Technology');
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSem, setSelectedSem] = useState(4);
  const [subjectCount, setSubjectCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Subjects configuration state
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Data Structures & Algorithms', code: 'CS401', facultyId: '', lectureHours: 3, isLab: true, labHours: 2, lectureRoomId: 'ROOM_101', labRoomId: 'LAB_CS1' },
    { id: 2, name: 'Database Management Systems', code: 'CS402', facultyId: '', lectureHours: 3, isLab: true, labHours: 2, lectureRoomId: 'ROOM_102', labRoomId: 'LAB_CS2' },
    { id: 3, name: 'Computer Networks', code: 'CS403', facultyId: '', lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_103', labRoomId: '' },
    { id: 4, name: 'Operating Systems', code: 'CS404', facultyId: '', lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_104', labRoomId: '' },
    { id: 5, name: 'Theory of Computation', code: 'CS405', facultyId: '', lectureHours: 3, isLab: false, labHours: 0, lectureRoomId: 'ROOM_105', labRoomId: '' }
  ]);

  // Filter free faculty for selected department
  const freeFaculty = facultyList.filter((f) => f.department === selectedDept);

  // Automatically assign available faculty when department changes
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

  // Update subject count handler
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

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
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

  const currentBatchTimetable = currentTimetables.find(
    (t) => t.departmentCode === selectedDept && parseInt(t.semester, 10) === parseInt(selectedSem, 10)
  );

  const getLabRuleBadge = (sem) => {
    const s = parseInt(sem, 10);
    if (s >= 7) return { label: '4th Year: Early Morning Lab (08:00 AM - 10:00 AM)', cls: 'badge-morning' };
    if (s >= 5) return { label: '3rd Year: Afternoon Session Lab (01:00 PM - 03:00 PM)', cls: 'badge-afternoon' };
    return { label: '1st & 2nd Year: Evening Session Lab (04:00 PM - 06:00 PM)', cls: 'badge-evening' };
  };

  const ruleBadge = getLabRuleBadge(selectedSem);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Step 1: Configuration Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={20} color="var(--primary)" /> Creator Wizard: Department & Semester Setup
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* College Name */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>College Name</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Department */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Department / Branch</label>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ width: '100%' }}>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.code}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Semester</label>
            <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} style={{ width: '100%' }}>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>Semester {sem} ({sem >= 7 ? '4th Year' : sem >= 5 ? '3rd Year' : sem >= 3 ? '2nd Year' : '1st Year'})</option>
              ))}
            </select>
          </div>

          {/* Subject Count */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Number of Subjects</label>
            <input
              type="number"
              min="1"
              max="10"
              value={subjectCount}
              onChange={(e) => handleSubjectCountChange(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Free Faculty Availability Counter (Flow 1 Requirement) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px 16px', borderRadius: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--secondary)" />
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Available Faculty for {selectedDept}: </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 800 }}>{freeFaculty.length} Professors Free</span>
            </div>
          </div>

          {/* Year-Based Lab Constraint Badge (Flow 2 Rule) */}
          <span className={`badge ${ruleBadge.cls}`} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            <Clock size={14} /> {ruleBadge.label}
          </span>
        </div>
      </div>

      {/* Step 2: Subject Cards (Sub 1 to Sub N) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="var(--primary)" /> Subject Specifications ({subjects.length} Subjects)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {subjects.map((sub, idx) => (
            <div key={sub.id} style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-morning" style={{ fontSize: '0.75rem' }}>Subject {idx + 1}</span>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sub.isLab}
                    onChange={(e) => handleSubjectChange(idx, 'isLab', e.target.checked)}
                  />
                  Has Practical Lab?
                </label>
              </div>

              {/* Subject Name & Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subject Name</label>
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code</label>
                  <input
                    type="text"
                    value={sub.code}
                    onChange={(e) => handleSubjectChange(idx, 'code', e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Faculty Select */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Faculty</label>
                <select
                  value={sub.facultyId}
                  onChange={(e) => handleSubjectChange(idx, 'facultyId', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  {freeFaculty.map((fac) => (
                    <option key={fac.id} value={fac.id}>{fac.name} ({fac.department})</option>
                  ))}
                </select>
              </div>

              {/* Room Selections */}
              <div style={{ display: 'grid', gridTemplateColumns: sub.isLab ? '1fr 1fr' : '1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lecture Room</label>
                  <select
                    value={sub.lectureRoomId}
                    onChange={(e) => handleSubjectChange(idx, 'lectureRoomId', e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    {roomList.filter((r) => r.type === 'LECTURE').map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {sub.isLab && (
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lab Room (2 Hrs)</label>
                    <select
                      value={sub.labRoomId}
                      onChange={(e) => handleSubjectChange(idx, 'labRoomId', e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      {roomList.filter((r) => r.type === 'LAB').map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button className="btn-primary" onClick={handleGenerate} disabled={isGenerating} style={{ padding: '12px 28px', fontSize: '1rem' }}>
            <Sparkles size={20} /> {isGenerating ? 'Generating Conflict-Free Schedule...' : 'Generate Smart Timetable'}
          </button>
        </div>
      </div>

      {/* Step 3: Display Generated Timetable */}
      {currentBatchTimetable && (
        <div style={{ marginTop: '12px' }}>
          <TimetableGrid timetable={currentBatchTimetable} />
        </div>
      )}
    </div>
  );
}
