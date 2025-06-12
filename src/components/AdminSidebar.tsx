import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

function Accordion({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        if (ref.current) setMaxHeight(ref.current.scrollHeight);
      });
    } else {
      if (ref.current) setMaxHeight(0);
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!shouldRender && !open) return null;

  return (
    <div
      style={{
        maxHeight,
        overflow: 'hidden',
        transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxSizing: 'border-box',
      }}
    >
      <div ref={ref} style={{ boxSizing: 'border-box' }}>{children}</div>
    </div>
  );
}

export default function AdminSidebar() {
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <aside style={{ width: 180, background: '#222', color: '#fff', minHeight: '100vh', padding: 24 }}>
      <h2 style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 32 }}>관리자</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, boxSizing: 'border-box' }}>
          <li style={{ margin: '18px 0' }}><Link href="/admin/dashboard">대시보드</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/customers">회원</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/sellers">판매자</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/products">상품관리</Link></li>
          <li style={{ margin: '18px 0', display: 'flex', alignItems: 'center' }}>
            <Link href="/admin/auction-management" style={{ flex: 1 }}>경매</Link>
            <button
              aria-label="경매 하위 메뉴 열기"
              onClick={e => { e.stopPropagation(); setAuctionOpen(v => !v); }}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, marginLeft: 4 }}
            >
              {auctionOpen ? '▴' : '▾'}
            </button>
          </li>
          <Accordion open={auctionOpen}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginLeft: 16, boxSizing: 'border-box' }}>
              <li style={{ margin: 0, boxSizing: 'border-box', padding: '0 0 8px 0' }}><Link href="/admin/auction-management/list">경매 목록</Link></li>
              <li style={{ margin: 0, boxSizing: 'border-box', padding: '8px 0' }}><Link href="/admin/auction-management/bid">입찰 내역</Link></li>
              <li style={{ margin: 0, boxSizing: 'border-box', padding: '8px 0' }}><Link href="/admin/auction-management/penalty">사용자 패널티</Link></li>
              <li style={{ margin: 0, boxSizing: 'border-box', padding: '8px 0' }}><Link href="/admin/auction-management/register">경매 등록</Link></li>
            </ul>
          </Accordion>
          <li style={{ margin: '18px 0' }}><Link href="/admin/settlement-management">정산</Link></li>
          <li style={{ margin: '18px 0', display: 'flex', alignItems: 'center' }}>
            <Link href="/admin/review-management" style={{ flex: 1 }}>리뷰</Link>
            <button
              aria-label="리뷰 하위 메뉴 열기"
              onClick={e => { e.stopPropagation(); setReviewOpen(v => !v); }}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, marginLeft: 4 }}
            >
              {reviewOpen ? '▴' : '▾'}
            </button>
          </li>
          <Accordion open={reviewOpen}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginLeft: 16, boxSizing: 'border-box' }}>
              <li style={{ margin: 0, boxSizing: 'border-box', padding: '0 0 8px 0' }}><Link href="/admin/review-management/list">리뷰 목록</Link></li>
              <li style={{ margin: 0, boxSizing: 'border-box', padding: '8px 0' }}><Link href="/admin/review-management/reported">리뷰 신고 관리</Link></li>
              <li style={{ margin: 0, boxSizing: 'border-box', padding: '8px 0' }}><Link href="/admin/review-management/qna">Q&A 관리</Link></li>
            </ul>
          </Accordion>
        </ul>
      </nav>
    </aside>
  );
} 