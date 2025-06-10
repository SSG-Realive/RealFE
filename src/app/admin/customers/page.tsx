import React from 'react';

const AdminCustomersPage = () => {
  return (
    <div>
      <h2>고객 관리</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="고객명/ID 검색" style={{ marginRight: 8 }} />
        <button>검색</button>
      </div>
      <table style={{ width: '100%', background: '#eee' }}>
        <thead>
          <tr>
            <th>고객명</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>홍길동</td>
            <td>hong@test.com</td>
            <td>2024-06-10</td>
            <td>활성</td>
            <td><button>보기</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminCustomersPage; 