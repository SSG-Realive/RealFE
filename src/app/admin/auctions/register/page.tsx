import React from 'react';

const AuctionRegisterPage = () => {
  return (
    <div>
      <h2>경매 등록</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>상품명 입력</label>
          <input type="text" style={{ width: 300 }} />
        </div>
        <div>
          <label>카테고리 지정</label>
          <div>
            <label><input type="radio" name="category" /> 의자</label>
            <label><input type="radio" name="category" /> 책상</label>
            <label><input type="radio" name="category" /> 소파</label>
            <label><input type="radio" name="category" /> 침대</label>
            <label><input type="radio" name="category" /> 수납장</label>
          </div>
        </div>
        <div>
          <label>사용감 지정</label>
          <div>
            <label><input type="radio" name="condition" /> 상</label>
            <label><input type="radio" name="condition" /> 중</label>
            <label><input type="radio" name="condition" /> 하</label>
          </div>
        </div>
        <div>
          <label>금액 입력</label>
          <input type="number" style={{ width: 200 }} />
        </div>
        <div>
          <label>상품 설명</label>
          <textarea style={{ width: 400, height: 80 }} />
        </div>
        <div>
          <label>이미지 첨부</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 80, height: 80, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>이미지</div>
            <div style={{ width: 80, height: 80, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>이미지</div>
            <div style={{ width: 80, height: 80, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>이미지</div>
          </div>
        </div>
        <button type="submit">경매등록</button>
      </form>
    </div>
  );
};

export default AuctionRegisterPage; 