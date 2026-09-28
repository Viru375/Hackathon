// src/components/LoginModal.jsx
import React, { useState } from 'react';
import { ShieldAlert, UserCheck, GraduationCap, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { DEPARTMENTS, SEMESTERS } from '../../server/store.js';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, facultyList }) {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('CREATOR'); // 'CREATOR' | 'FACULTY' | 'STUDENT'
  const [username, setUsername] = useState('creator');
  const [password, setPassword] = useState('creator123');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState(4);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'CREATOR') {
      setUsername('creator');
      setPassword('creator123');
    } else if (newRole === 'FACULTY') {
      const demoFac = facultyList[0];
      setUsername(demoFac ? demoFac.username : 'rajesh_sharma');
      setPassword('faculty123');
    } else {
      setUsername('student');
      setPassword('student123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    if (role === 'CREATOR') {
      onLoginSuccess({
        id: 'CREATOR_01',
        name: fullName || 'Dr. Dean (Creator)',
        role: 'CREATOR',
        department: 'ALL'
      });
    } else if (role === 'FACULTY') {
      const foundFac = facultyList.find((f) => f.username === username || f.email === username);
      const facObj = foundFac || facultyList[0];
      onLoginSuccess({
        id: facObj.id,
        name: facObj.name,
        role: 'FACULTY',
        department: facObj.department,
        email: facObj.email
      });
    } else {
      onLoginSuccess({
        id: 'STUDENT_01',
        name: fullName || 'Rahul Kumar (Student)',
        role: 'STUDENT',
        department: department,
        semester: parseInt(semester, 10),
        batchName: `${department}-Sem${semester}`
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '32px',
        border: '1px solid var(--border-glow)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
      }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#fff',
            marginBottom: '12px'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>Smart Timetable Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isSignup ? 'Create a new account' : 'Sign in to access your role dashboard'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`role-btn ${role === 'CREATOR' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleChange('CREATOR')}
            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <ShieldAlert size={14} /> Creator
          </button>

          <button
            type="button"
            className={`role-btn ${role === 'FACULTY' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleChange('FACULTY')}
            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <UserCheck size={14} /> Faculty
          </button>

          <button
            type="button"
            className={`role-btn ${role === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleChange('STUDENT')}
            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <GraduationCap size={14} /> Student
          </button>
        </div>

        {/* Form Error */}
        {error && (
          <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '8px', color: '#fda4af', fontSize: '0.82rem', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {isSignup && (
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Prof. Rajesh Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Username or Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          {role === 'STUDENT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%' }}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.code}>{d.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{ width: '100%' }}>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '12px', justifyContent: 'center', width: '100%' }}>
            {isSignup ? 'Create Account & Login' : `Sign In as ${role}`} <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            ⚡ 1-Click Quick Demo Login:
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, fontSize: '0.72rem', padding: '6px', justifyContent: 'center' }}
              onClick={() => {
                handleRoleChange('CREATOR');
                onLoginSuccess({ id: 'CREATOR_01', name: 'Dr. Dean (Creator)', role: 'CREATOR', department: 'ALL' });
              }}
            >
              🛡️ Creator
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, fontSize: '0.72rem', padding: '6px', justifyContent: 'center' }}
              onClick={() => {
                handleRoleChange('FACULTY');
                const fac = facultyList[0];
                onLoginSuccess({ id: fac.id, name: fac.name, role: 'FACULTY', department: fac.department, email: fac.email });
              }}
            >
              👨‍🏫 Faculty
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, fontSize: '0.72rem', padding: '6px', justifyContent: 'center' }}
              onClick={() => {
                handleRoleChange('STUDENT');
                onLoginSuccess({ id: 'STUDENT_01', name: 'Rahul Kumar', role: 'STUDENT', department: 'CSE', semester: 4, batchName: 'CSE-Sem4' });
              }}
            >
              🎓 Student
            </button>
          </div>
        </div>

        {/* Toggle Signup/Login */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
