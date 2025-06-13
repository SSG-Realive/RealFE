import React from 'react';
import AdminNotification from './AdminNotification';

export default function AdminHeader() {
  return (
    <header style={{
      background: '#333',
      color: '#fff',
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 22, color: '#fff' }}>Admin Dashboard</div>
      <AdminNotification />
    </header>
  );
} 