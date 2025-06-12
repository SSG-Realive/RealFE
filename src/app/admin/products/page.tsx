import React from 'react';

const dummyProducts = [
  { id: 1, name: '의자', category: '가구', price: 50000, status: '판매중' },
  { id: 2, name: '책상', category: '가구', price: 120000, status: '품절' },
];

export default function AdminProductsPage() {
  return (
    <div>
      <h2>상품 관리</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr style={{ background: '#f7f7f7' }}>
            <th style={{ padding: 8, border: '1px solid #eee' }}>상품명</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>카테고리</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>가격</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {dummyProducts.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{p.name}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{p.category}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{p.price.toLocaleString()}원</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 