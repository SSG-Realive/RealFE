import React from 'react';

const AdminReviewListPage = () => {
  return (
    <div>
      <h2>리뷰 목록</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="검색어를 입력하세요" style={{ width: 300, marginRight: 8 }} />
        <button>검색</button>
      </div>
      <div style={{ background: '#eee', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 80, height: 80, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>이미지</div>
          <div>리뷰 내용 미리보기</div>
          <div>작성자</div>
          <div>작성일</div>
          <button>상세보기</button>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewListPage; 