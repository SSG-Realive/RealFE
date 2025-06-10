'use client';
import React from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <AdminHeader />
        <main style={{ padding: '20px' }}>{children}</main>
      </div>
    </div>
  );
} 