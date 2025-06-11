import React from 'react';

const orders = [
  { id: 1, product: '의자', customer: 'Hong Gil-dong', seller: 'Kim Young-hee', status: 'Shipping', amount: 50000, date: '2024-06-10', action: 'View' },
  { id: 2, product: '책상', customer: 'Park Dong-min', seller: 'Hong Gil-dong', status: 'Pending', amount: 120000, date: '2024-06-09', action: 'View' },
  { id: 3, product: '소파', customer: 'Kim Young-hee', seller: 'Park Dong-min', status: 'Delivered', amount: 300000, date: '2024-06-08', action: 'View' },
];

export default function AdminOrdersPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f4' }}>
      {/* 사이드바 */}
      <aside style={{ width: 120, background: '#e0e0e0', padding: 16 }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ margin: '16px 0' }}>고객</li>
            <li style={{ margin: '16px 0' }}>판매자</li>
            <li style={{ margin: '16px 0' }}>주문</li>
            <li style={{ margin: '16px 0', fontWeight: 'bold' }}>주문</li>
            <li style={{ margin: '16px 0' }}>상품</li>
            <li style={{ margin: '16px 0' }}>FAQ</li>
          </ul>
        </nav>
      </aside>
      {/* 메인 */}
      <main style={{ flex: 1, background: '#fff', padding: 32 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 'bold', fontSize: 24 }}>주문 관리</h2>
          <span style={{ fontWeight: 'bold' }}>admin</span>
        </header>
        {/* 필터/검색 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input placeholder="고객/판매자/상품 검색" style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }} />
          <select style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }}>
            <option>상태 전체</option>
            <option>Shipping</option>
            <option>Pending</option>
            <option>Delivered</option>
          </select>
          <button style={{ padding: '4px 16px', background: '#222', color: '#fff', border: 'none', borderRadius: 4 }}>검색</button>
        </div>
        {/* 테이블 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Product</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Customer</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Seller</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Amount</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Date</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{o.product}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{o.customer}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{o.seller}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <span style={{ background: o.status === 'Shipping' ? '#2196f3' : o.status === 'Pending' ? '#ffd600' : '#4caf50', color: '#fff', padding: '2px 10px', borderRadius: 4, fontWeight: 'bold' }}>{o.status}</span>
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{o.amount.toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{o.date}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}><button style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px' }}>{o.action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
} 