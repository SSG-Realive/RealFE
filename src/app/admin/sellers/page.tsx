import React from 'react';

const dummySellers = [
  { id: 1, name: '이상훈', email: 'sang@test.com', status: 'Active' },
  { id: 2, name: '박지민', email: 'park@test.com', status: 'Request' },
];

export default function AdminSellersPage() {
  return (
    <div>
      <h2>판매자 관리</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr style={{ background: '#f7f7f7' }}>
            <th style={{ padding: 8, border: '1px solid #eee' }}>이름</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>이메일</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {dummySellers.map((s) => (
            <tr key={s.id}>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{s.name}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{s.email}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 