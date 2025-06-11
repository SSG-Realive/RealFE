import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside style={{ width: 180, background: '#222', color: '#fff', minHeight: '100vh', padding: 24 }}>
      <h2 style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 32 }}>관리자</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ margin: '18px 0' }}><Link href="/admin/dashboard">대시보드</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/customers">회원관리</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/sellers">판매자관리</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/products">상품관리</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/auctions">경매관리</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/reviews">리뷰관리</Link></li>
          <li style={{ margin: '18px 0' }}><Link href="/admin/qna">Q&A관리</Link></li>
        </ul>
      </nav>
    </aside>
  );
} 