import React from 'react';

const customers = [
  { id: 1, name: 'Hong Gil-dong', email: 'hong@test.com', status: 'Active', joined: '2024-06-10', note: 'Normal', action: 'View' },
  { id: 2, name: 'Kim Young-hee', email: 'kim@test.com', status: 'Request', joined: '2024-06-09', note: 'Requested', action: 'View' },
  { id: 3, name: 'Park Dong-min', email: 'park@test.com', status: 'Blocked', joined: '2024-06-08', note: 'Blocked', action: 'View' },
];

export default function AdminCustomersPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f4' }}>
      {/* 사이드바 */}
      <aside style={{ width: 120, background: '#e0e0e0', padding: 16 }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ margin: '16px 0', fontWeight: 'bold' }}>고객</li>
            <li style={{ margin: '16px 0' }}>판매자</li>
            <li style={{ margin: '16px 0' }}>주문</li>
            <li style={{ margin: '16px 0' }}>상품</li>
            <li style={{ margin: '16px 0' }}>FAQ</li>
          </ul>
        </nav>
      </aside>
      {/* 메인 */}
      <main style={{ flex: 1, background: '#fff', padding: 32 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 'bold', fontSize: 24 }}>Customers</h2>
          <span style={{ fontWeight: 'bold' }}>admin</span>
        </header>
        {/* 필터/검색 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input placeholder="이름/이메일 검색" style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }} />
          <select style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }}>
            <option>상태 전체</option>
            <option>Active</option>
            <option>Request</option>
            <option>Blocked</option>
          </select>
          <button style={{ padding: '4px 16px', background: '#222', color: '#fff', border: 'none', borderRadius: 4 }}>검색</button>
        </div>
        {/* 테이블 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Name</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Email</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>가입일</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Note</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{c.name}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{c.email}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <span style={{ background: c.status === 'Active' ? '#ffd600' : c.status === 'Request' ? '#ff9800' : '#bdbdbd', color: '#222', padding: '2px 10px', borderRadius: 4, fontWeight: 'bold' }}>{c.status}</span>
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{c.joined}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{c.note}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}><button style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px' }}>{c.action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
} 