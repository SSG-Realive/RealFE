'use client';
import React, { useState } from 'react';

const dummyCustomers = [
  { id: 1, name: '홍길동', email: 'hong@test.com', status: 'Active', image: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { id: 2, name: '김영희', email: 'kim@test.com', status: 'Blocked', image: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { id: 3, name: '이수민', email: 'soo@test.com', status: 'Active', image: 'https://randomuser.me/api/portraits/men/13.jpg' },
  { id: 4, name: '박철수', email: 'park@test.com', status: 'Active', image: 'https://randomuser.me/api/portraits/men/14.jpg' },
  { id: 5, name: '최지우', email: 'choi@test.com', status: 'Blocked', image: 'https://randomuser.me/api/portraits/women/15.jpg' },
  { id: 6, name: '정수빈', email: 'jung@test.com', status: 'Active', image: 'https://randomuser.me/api/portraits/women/16.jpg' },
  { id: 7, name: '한가람', email: 'han@test.com', status: 'Active', image: 'https://randomuser.me/api/portraits/men/17.jpg' },
  { id: 8, name: '오세훈', email: 'oh@test.com', status: 'Blocked', image: 'https://randomuser.me/api/portraits/men/18.jpg' },
  { id: 9, name: '유재석', email: 'yoo@test.com', status: 'Active', image: 'https://randomuser.me/api/portraits/men/19.jpg' },
  { id: 10, name: '강호동', email: 'kang@test.com', status: 'Active', image: 'https://randomuser.me/api/portraits/men/20.jpg' },
];

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filtered = dummyCustomers.filter(c =>
    (c.name.includes(search) || c.email.includes(search)) &&
    (!status || c.status === status)
  );
  return (
    <div>
      <h2>고객 관리</h2>
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
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 0 }}>
        <thead>
          <tr style={{ background: '#f7f7f7' }}>
            <th style={{ padding: 8, border: '1px solid #eee' }}>사진</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>이름</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>이메일</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: 8, border: '1px solid #eee' }}><img src={c.image} alt="customer" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /></td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{c.name}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{c.email}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 