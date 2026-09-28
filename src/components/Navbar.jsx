// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ currentUser, onOpenLogin, onLogout }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme_preference') || 'system';
    } catch (e) {
      return 'system';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme_preference', theme);
    } catch (e) {}

    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun size={14} />;
    if (theme === 'dark') return <Moon size={14} />;
    return <Monitor size={14} />;
  };

  return (
    <header className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
      
      {/* Header Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Timetable Scheduler</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active User Badge */}
          {currentUser && (
            <div style={{ fontSize: '13px', color: 'var(--mut)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={14} />
              <span>{currentUser.name}</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn-secondary theme-toggle"
            onClick={cycleTheme}
            title={`Theme: ${theme.toUpperCase()}`}
            style={{ fontSize: '12px', padding: '6px 10px' }}
          >
            {getThemeIcon()}
            <span style={{ textTransform: 'capitalize' }}>{theme}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={currentUser ? onLogout : onOpenLogin}
            style={{ fontSize: '12px', padding: '6px 10px' }}
          >
            {currentUser ? <LogOut size={14} /> : <LogIn size={14} />}
            {currentUser ? 'Sign out' : 'Sign in'}
          </button>
        </div>
      </div>

      {currentUser && (
        <div className="nav-pills" aria-label={`${currentUser.role.toLowerCase()} dashboard`}>
          <span className="pill-btn active">
            {currentUser.role === 'CREATOR' ? 'Scheduler dashboard' : `${currentUser.role.toLowerCase()} dashboard`}
          </span>
        </div>
      )}

    </header>
  );
}
