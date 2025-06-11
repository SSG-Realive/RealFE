import React from 'react';

export default function AuctionRegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f4' }}>
      {/* 사이드바 */}
      <aside style={{ width: 120, background: '#e0e0e0', padding: 16 }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ margin: '16px 0' }}>고객</li>
            <li style={{ margin: '16px 0' }}>판매자</li>
            <li style={{ margin: '16px 0' }}>주문</li>
            <li style={{ margin: '16px 0' }}>상품</li>
            <li style={{ margin: '16px 0', fontWeight: 'bold' }}>경매</li>
            <li style={{ margin: '16px 0' }}>FAQ</li>
          </ul>
        </nav>
      </aside>
      {/* 메인 */}
      <main style={{ flex: 1, background: '#fff', padding: 32 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 'bold', fontSize: 24 }}>경매등록</h2>
          <span style={{ fontWeight: 'bold' }}>admin</span>
        </header>
        <form style={{ maxWidth: 600, margin: '0 auto', background: '#fafafa', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <div style={{ marginBottom: 16 }}>
            <label>상품명</label>
            <input type="text" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>이미지</label>
            <input type="file" />
          </div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label>시작가</label>
              <input type="number" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label>즉시구매가</label>
              <input type="number" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label>시작일</label>
              <input type="date" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label>마감일</label>
              <input type="date" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>설명</label>
            <textarea style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} rows={3} />
          </div>
          <button type="submit" style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 32px', fontWeight: 'bold' }}>등록</button>
        </form>
      </main>
    </div>
  );
} 