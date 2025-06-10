import React from 'react';

const SellerApprovalPage = () => {
  return (
    <div>
      <h2>판매자 승인</h2>
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
            <th>승인</th>
            <th>거절</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>성춘향</td>
            <td>sung@test.com</td>
            <td>2024-06-08</td>
            <td>대기</td>
            <td><button>승인</button></td>
            <td><button>거절</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SellerApprovalPage; 