import React from 'react';

const AdminReviewManagePage = () => {
  return (
    <div>
      <h2>리뷰 관리</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="리뷰/작성자 검색" style={{ marginRight: 8 }} />
        <button>검색</button>
      </div>
      <table style={{ width: '100%', background: '#eee' }}>
        <thead>
          <tr>
            <th>리뷰 내용</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>좋아요!</td>
            <td>user1</td>
            <td>2024-06-10</td>
            <td>노출</td>
            <td><button>보기</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminReviewManagePage; 