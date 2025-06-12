import React from 'react';

const dummyCustomers = [
  { id: 1, name: '홍길동', email: 'hong@test.com', status: 'Active' },
  { id: 2, name: '김영희', email: 'kim@test.com', status: 'Blocked' },
];

export default function AdminCustomersPage() {
  return (
    <div>
      <h2>고객 관리</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr style={{ background: '#f7f7f7' }}>
            <th style={{ padding: 8, border: '1px solid #eee' }}>이름</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>이메일</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {dummyCustomers.map((c) => (
            <tr key={c.id}>
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