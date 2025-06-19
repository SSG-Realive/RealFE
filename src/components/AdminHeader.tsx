"use client";
import React from 'react';
import AdminNotification from './AdminNotification';
import { useAdminAuthStore } from '@/store/admin/useAdminAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminHeader({ title }: { title: string }) {
  const { accessToken, logout } = useAdminAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleLogin = () => {
    router.push('/admin/login');
  };

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
      <div style={{ fontWeight: 'bold', fontSize: 22, color: '#fff' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <AdminNotification />
        {accessToken ? (
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 12,
              padding: '6px 18px',
              background: '#fff',
              color: '#333',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 15
            }}
          >
            로그아웃
          </button>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              marginLeft: 12,
              padding: '6px 18px',
              background: '#fff',
              color: '#333',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 15
            }}
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
} 