import React from 'react';
import AdminNotification from './AdminNotification';

export default function AdminHeader() {
  return (
    <header style={{ background: '#222', color: '#fff', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontWeight: 'bold', color: '#ff5252', marginRight: 8 }}>[관리자]</span>
        Realive Admin Panel
      </div>
      <AdminNotification />
    </header>
  );
} 