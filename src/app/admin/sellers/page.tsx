import React from 'react';

const sellers = [
  { id: 1, name: 'Hong Gil-dong', email: 'hong@test.com', status: 'Approved', joined: '2024-06-10', products: 5, grade: 'A', action: 'View' },
  { id: 2, name: 'Kim Young-hee', email: 'kim@test.com', status: 'Request', joined: '2024-06-09', products: 2, grade: 'B', action: 'View' },
  { id: 3, name: 'Park Dong-min', email: 'park@test.com', status: 'Blocked', joined: '2024-06-08', products: 0, grade: 'C', action: 'View' },
];

export default function AdminSellersPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f4' }}>
      {/* 사이드바 */}
      <aside style={{ width: 120, background: '#e0e0e0', padding: 16 }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ margin: '16px 0' }}>고객</li>
            <li style={{ margin: '16px 0', fontWeight: 'bold' }}>판매자</li>
            <li style={{ margin: '16px 0' }}>주문</li>
            <li style={{ margin: '16px 0' }}>상품</li>
            <li style={{ margin: '16px 0' }}>FAQ</li>
          </ul>
        </nav>
      </aside>
      {/* 메인 */}
      <main style={{ flex: 1, background: '#fff', padding: 32 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 'bold', fontSize: 24 }}>판매자 관리</h2>
          <span style={{ fontWeight: 'bold' }}>admin</span>
        </header>
        {/* 필터/검색 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input placeholder="이름/이메일 검색" style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }} />
          <select style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }}>
            <option>상태 전체</option>
            <option>Approved</option>
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
              <th style={{ padding: 8, border: '1px solid #eee' }}>Products</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Grade</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{s.name}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{s.email}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <span style={{ background: s.status === 'Approved' ? '#4caf50' : s.status === 'Request' ? '#ff9800' : '#bdbdbd', color: '#fff', padding: '2px 10px', borderRadius: 4, fontWeight: 'bold' }}>{s.status}</span>
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{s.joined}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{s.products}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{s.grade}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}><button style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px' }}>{s.action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
} 