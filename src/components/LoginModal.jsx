// src/components/LoginModal.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { DEPARTMENTS, SEMESTERS } from '../../server/store.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const demoAccounts = {
  CREATOR: { username: 'creator', password: 'creator123' },
  FACULTY: { username: 'faculty', password: 'faculty123' },
  STUDENT: { username: 'student', password: 'student123' }
};

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('CREATOR');
  const [username, setUsername] = useState(demoAccounts.CREATOR.username);
  const [password, setPassword] = useState(demoAccounts.CREATOR.password);
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setUsername(demoAccounts[nextRole].username);
    setPassword(demoAccounts[nextRole].password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password || (isSignup && !fullName.trim())) {
      toast.error('Complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${isSignup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, name: fullName, department, semester })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed.');
      await onLoginSuccess(data.user, data.token);
      toast.success(isSignup ? 'Account created. You are signed in.' : `Welcome, ${data.user.name}.`);
    } catch (error) {
      toast.error(error.message || 'Could not connect to the authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSignup = () => {
    const nextSignup = !isSignup;
    setIsSignup(nextSignup);
    if (nextSignup) selectRole('STUDENT');
  };

  return (
    <div className="auth-overlay" role="presentation">
      <section className="section-card auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <header className="auth-heading">
          <div>
            <p className="auth-eyebrow">SMART TIMETABLE</p>
            <h2 className="section-title" id="auth-title">{isSignup ? 'Create student account' : 'Sign in to continue'}</h2>
          </div>
          {onClose && <button type="button" className="btn-secondary btn-sm" onClick={onClose} aria-label="Close sign in">×</button>}
        </header>

        {!isSignup && (
          <div className="auth-roles" aria-label="Account type">
            {Object.keys(demoAccounts).map((accountRole) => (
              <button
                key={accountRole}
                type="button"
                className={`btn-secondary btn-sm ${role === accountRole ? 'btn-primary' : ''}`}
                onClick={() => selectRole(accountRole)}
              >
                {accountRole[0] + accountRole.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="form-group">
              <label htmlFor="auth-name">Full name</label>
              <input id="auth-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="auth-username">Username</label>
            <input id="auth-username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : undefined} />
          </div>

          {isSignup && (
            <div className="form-grid auth-student-fields">
              <div className="form-group">
                <label htmlFor="auth-department">Department</label>
                <select id="auth-department" value={department} onChange={(event) => setDepartment(event.target.value)}>
                  {DEPARTMENTS.map((item) => <option key={item.id} value={item.code}>{item.code}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="auth-semester">Semester</label>
                <select id="auth-semester" value={semester} onChange={(event) => setSemester(event.target.value)}>
                  {SEMESTERS.map((item) => <option key={item} value={item}>Semester {item}</option>)}
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : `Sign in as ${role.toLowerCase()}`}
          </button>
        </form>

        {!isSignup && (
          <div className="auth-demo">
            <span>Demo account</span>
            <button type="button" className="btn-secondary btn-sm" onClick={() => selectRole(role)}>
              Use {role.toLowerCase()} demo
            </button>
          </div>
        )}

        <button type="button" className="auth-toggle" onClick={toggleSignup}>
          {isSignup ? 'Already registered? Sign in' : 'New student? Create an account'}
        </button>
      </section>
    </div>
  );
}
