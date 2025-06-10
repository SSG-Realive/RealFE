import React from 'react';

const AdminSellersPage = () => {
  return (
    <div>
      <h2>판매자 관리</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="판매자명/ID 검색" style={{ marginRight: 8 }} />
        <button>검색</button>
      </div>
      <table style={{ width: '100%', background: '#eee' }}>
        <thead>
          <tr>
            <th>판매자명</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>이몽룡</td>
            <td>lee@test.com</td>
            <td>2024-06-09</td>
            <td>승인대기</td>
            <td><button>보기</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminSellersPage; 