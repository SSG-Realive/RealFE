'use client';
import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={{ flex: 1 }}>
        <AdminHeader />
        <main style={{ padding: '20px' }}>{children}</main>
      </div>
    </div>
  );
} 