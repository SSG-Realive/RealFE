'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface Seller {
  id: number;
  name: string;
  email: string;
  status: string;
  image?: string;
}

export default function AdminSellersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
    window.location.replace('/admin/login');
    return null;
  }

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      userType: 'SELLER',
      page: '0',
      size: '100',
    });
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
    apiClient.get(`/admin/users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        setSellers(res.data.data.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = sellers.filter(s =>
    (s.name?.includes(search) || s.email?.includes(search)) &&
    (!status || s.status === status)
  );

  return (
    <div>
      <h2>판매자 관리</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="이름/이메일 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 200, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
        >
          <option value="">전체</option>
          <option value="승인">승인</option>
          <option value="승인 처리 전">승인 처리 전</option>
        </select>
      </div>
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>사진</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>이름</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>이메일</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}><img src={s.image || '/public/images/placeholder.png'} alt="seller" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /></td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{s.name}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{s.email}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  {s.status === '승인 처리 전' ? (
                    <button
                      style={{ background: '#4caf50', color: '#fff', padding: '4px 12px', borderRadius: 4, border: 'none', fontWeight: 'bold' }}
                      onClick={() => alert(`${s.name} 판매자 승인처리! (추후 구현)`)}
                    >
                      승인처리
                    </button>
                  ) : (
                    s.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 