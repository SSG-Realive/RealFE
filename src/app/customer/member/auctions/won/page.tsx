// src/app/customer/member/auctions/won/page.tsx (링크 수정 최종안)
'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link'; // Link 임포트
import useRequireAuth from '@/hooks/useRequireAuth';
import { useWonAuctionStore } from '@/store/customer/wonAuctionStore';
import { WonAuction } from '@/types/customer/auctions';

// --- [수정] Link 경로와 구조를 올바르게 수정한 카드 컴포넌트 ---
function WonAuctionItemCard({ auction, isLast, refCallback }: { auction: WonAuction, isLast: boolean, refCallback: (node: HTMLLIElement | null) => void }) {
  
  const {
    auctionId,
    productName,
    productImageUrl,
    winningBidPrice,
    auctionEndTime
  } = auction;

  return (
    <li ref={isLast ? refCallback : null}>
      <Link
        href={`/customer/member/auctions/won/${auctionId}`}
        className="block rounded-2xl bg-white shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      >
        <div className="h-40 bg-gray-100 rounded-t-2xl overflow-hidden">
          <img
            src={productImageUrl || 'https://placehold.co/400x300?text=No+Image'}
            alt={productName || '상품 이미지'}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 text-left">
          <p className="text-base font-semibold text-gray-800 truncate" title={productName}>
            {productName ?? '상품 정보 없음'}
          </p>
          <p className="text-lg font-bold text-red-600 mt-2">
            {winningBidPrice?.toLocaleString()}
            <span className="ml-1 text-sm font-medium text-gray-700">원</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            경매 종료: {auctionEndTime ? new Date(auctionEndTime).toLocaleDateString() : '-'}
          </p>
        </div>
      </Link>
    </li>
  );
}


// --- 낙찰받은 경매 목록 페이지 ---
export default function WonAuctionsPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const {
    auctions, hasNext, loading, error,
    fetchWonAuctions, reset
  } = useWonAuctionStore();

  const observer = useRef<IntersectionObserver | null>(null);

  const lastAuctionRef = useCallback((node: HTMLLIElement | null) => {
    if (loading || !hasNext) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchWonAuctions();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasNext, fetchWonAuctions]);

  useEffect(() => {
    if (isAuthenticated && auctions.length === 0) {
      fetchWonAuctions();
    }
  }, [isAuthenticated, fetchWonAuctions]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>로그인 정보를 확인 중입니다...</div>;
  }
  if (!isAuthenticated) {
    return null;
  }
  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>에러: {error}</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <header style={{ marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
        <h1 className="text-2xl font-bold text-gray-800">낙찰받은 경매</h1>
        <p className="text-sm text-gray-600 mt-1">내가 낙찰받은 경매 목록입니다. 결제할 상품을 선택하세요.</p>
      </header>

      {auctions.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-16">
          낙찰받은 경매가 없습니다.
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {auctions.map((auction, idx) => (
            <WonAuctionItemCard
              key={`${auction.auctionId}-${idx}`}
              auction={auction}
              isLast={idx === auctions.length - 1}
              refCallback={lastAuctionRef}
            />
          ))}
        </ul>
      )}

      {loading && <div className="text-center py-8">목록을 불러오는 중...</div>}
      {!hasNext && auctions.length > 0 && (
        <div className="text-center text-gray-500 py-8">
          모든 낙찰 내역을 확인했습니다.
        </div>
      )}
    </div>
  );
}