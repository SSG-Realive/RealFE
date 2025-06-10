import React from 'react';

const AdminAuctionManagePage = () => {
  return (
    <div>
      <h2>경매 관리</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="경매명/ID 검색" style={{ marginRight: 8 }} />
        <button>검색</button>
      </div>
      <table style={{ width: '100%', background: '#eee' }}>
        <thead>
          <tr>
            <th>경매명</th>
            <th>시작가</th>
            <th>현재가</th>
            <th>상태</th>
            <th>마감일</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>의자 경매</td>
            <td>10,000</td>
            <td>15,000</td>
            <td>진행중</td>
            <td>2024-06-15</td>
            <td><button>보기</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminAuctionManagePage; 