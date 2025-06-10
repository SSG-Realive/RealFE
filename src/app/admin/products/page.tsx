import React from 'react';

const AdminProductsPage = () => {
  return (
    <div>
      <h2>상품 관리</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="상품명/ID 검색" style={{ marginRight: 8 }} />
        <button>검색</button>
      </div>
      <table style={{ width: '100%', background: '#eee' }}>
        <thead>
          <tr>
            <th>상품명</th>
            <th>카테고리</th>
            <th>등록일</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>의자</td>
            <td>가구</td>
            <td>2024-06-10</td>
            <td>판매중</td>
            <td><button>보기</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductsPage; 