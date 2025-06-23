import React, { useState, useEffect } from 'react';
import AdminNotification from './AdminNotification';

export default function AdminHeader({ title }: { title: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const handleLogin = () => {
    window.location.href = '/admin/login';
  };

  return (
    <header style={{
      background: '#fff',
      color: '#1f2937',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56,
      borderBottom: '1px solid #e5e7eb'
    }}>
      <h1 style={{ fontWeight: 'bold', fontSize: 20, color: '#1f2937' }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <AdminNotification />
        {isClient && (
          isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#14b8a6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                padding: '8px 16px',
                background: '#14b8a6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              로그인
            </button>
          )
        )}
      </div>
    </header>
  );
} 