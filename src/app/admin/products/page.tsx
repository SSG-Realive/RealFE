import React from 'react';

const products = [
  { id: 1, name: 'Modern Chair', category: 'Chair', status: 'On Sale', price: 50000, stock: 10, seller: 'Hong Gil-dong', date: '2024-06-10', action: 'View' },
  { id: 2, name: 'Wooden Desk', category: 'Desk', status: 'Sold Out', price: 120000, stock: 0, seller: 'Kim Young-hee', date: '2024-06-09', action: 'View' },
  { id: 3, name: 'Sofa', category: 'Sofa', status: 'On Sale', price: 300000, stock: 3, seller: 'Park Dong-min', date: '2024-06-08', action: 'View' },
];

export default function AdminProductsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f4' }}>
      {/* 사이드바 */}
      <aside style={{ width: 120, background: '#e0e0e0', padding: 16 }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ margin: '16px 0' }}>고객</li>
            <li style={{ margin: '16px 0' }}>판매자</li>
            <li style={{ margin: '16px 0' }}>주문</li>
            <li style={{ margin: '16px 0' }}>상품</li>
            <li style={{ margin: '16px 0', fontWeight: 'bold' }}>상품</li>
            <li style={{ margin: '16px 0' }}>FAQ</li>
          </ul>
        </nav>
      </aside>
      {/* 메인 */}
      <main style={{ flex: 1, background: '#fff', padding: 32 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 'bold', fontSize: 24 }}>상품 관리</h2>
          <span style={{ fontWeight: 'bold' }}>admin</span>
        </header>
        {/* 필터/검색 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input placeholder="상품명/카테고리 검색" style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }} />
          <select style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }}>
            <option>상태 전체</option>
            <option>On Sale</option>
            <option>Sold Out</option>
          </select>
          <button style={{ padding: '4px 16px', background: '#222', color: '#fff', border: 'none', borderRadius: 4 }}>검색</button>
        </div>
        {/* 테이블 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Name</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Category</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Price</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Stock</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Seller</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Date</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{p.name}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{p.category}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <span style={{ background: p.status === 'On Sale' ? '#4caf50' : '#bdbdbd', color: '#fff', padding: '2px 10px', borderRadius: 4, fontWeight: 'bold' }}>{p.status}</span>
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{p.price.toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{p.stock}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{p.seller}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{p.date}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}><button style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px' }}>{p.action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
} 