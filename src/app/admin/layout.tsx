'use client';
import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // children이 React element이고, pageTitle prop이 있으면 추출
  let pageTitle = '';
  if (React.isValidElement(children) && (children.props as any)?.pageTitle) {
    pageTitle = (children.props as any).pageTitle;
  }
  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={{ flex: 1 }}>
        <AdminHeader title={pageTitle} />
        <main style={{ padding: '20px' }}>{children}</main>
      </div>
    </div>
  );
} 