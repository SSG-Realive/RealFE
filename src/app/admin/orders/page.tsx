import React from 'react';

const AdminOrdersPage = () => {
  return (
    <div>
      <h2>주문 관리</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="주문번호/고객명 검색" style={{ marginRight: 8 }} />
        <button>검색</button>
      </div>
      <table style={{ width: '100%', background: '#eee' }}>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>고객명</th>
            <th>상품명</th>
            <th>주문일</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ORD001</td>
            <td>홍길동</td>
            <td>의자</td>
            <td>2024-06-10</td>
            <td>배송중</td>
            <td><button>보기</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrdersPage; 