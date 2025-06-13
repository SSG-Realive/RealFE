+'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const AdminReviewListPage = () => {
  const router = useRouter();
  return (
    <div>
      <h2>리뷰 목록</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="text" placeholder="검색어를 입력하세요" style={{ width: 300, marginRight: 8 }} />
        <button>검색</button>
        <select style={{ marginLeft: 8 }}>
          <option value="">전체</option>
          <option value="latest">최신순</option>
          <option value="like">좋아요순</option>
          <option value="report">신고많은순</option>
        </select>
      </div>
      <div style={{ background: '#eee', padding: 16 }}>
        {[1,2,3].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 80, height: 80, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>이미지</div>
            <div>리뷰 내용 미리보기</div>
            <div>작성자</div>
            <div>작성일</div>
            <button onClick={() => router.push(`/admin/reviews/${item}`)}>상세보기</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviewListPage; 