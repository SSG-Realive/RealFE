'use client'

import { Auction } from '@/types/customer/auctions'
import Link from 'next/link'
import { useEffect, useRef } from 'react'


/* ────────────────────────────────────────── */
/* ① “카드 한 장” – Export 이름을 붙여서 제공   */
/* ────────────────────────────────────────── */
export function AuctionItemCard({ auction }: { auction: Auction }) {
  const {
    id,
    startPrice,
    currentPrice,
    endTime,
    adminProduct,
  } = auction

  // 경매 종료까지 남은 시간 계산
  const timeRemaining = endTime ? new Date(endTime).getTime() - new Date().getTime() : 0;
  const isEnding = timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000; // 24시간 미만

  return (
    <li className="shrink-0 w-52 sm:w-60 px-2">
      <Link
        href={`/auctions/${id}`}
        className="block rounded-md bg-white shadow hover:shadow-lg transition"
      >
        <div className="h-32 sm:h-40 bg-gray-100 rounded-t-md overflow-hidden">
          <img
            src={adminProduct?.imageUrl || '/images/placeholder.png'}
            alt={adminProduct?.productName || '상품'}
            className="w-full h-full object-contain"
          />
          {/* 상태 배지 */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              status === 'PROCEEDING' 
                ? (isEnding ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800')
                : 'bg-gray-100 text-gray-800'
            }`}>
              {status === 'PROCEEDING' ? (isEnding ? '마감임박' : '진행중') : status}
            </span>
          </div>
        </div>
        <div className="p-2 text-xs sm:text-sm space-y-0.5">
          <h3 className="font-semibold truncate">
            {adminProduct?.productName ?? '상품 없음'}
          </h3>
          <p>시작가 {startPrice?.toLocaleString() ?? '-'}</p>
          <p className="font-bold text-amber-600">
            현재가 {currentPrice?.toLocaleString() ?? '-'}
          </p>
          <p className="text-[11px] text-gray-500">
            종료 {endTime ? new Date(endTime).toLocaleString() : '-'}
          </p>
        </div>
      </Link>

      {/* 하단 액션 영역 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        {isLoggedIn ? (
          <div className="flex gap-2">
            <Link 
              href={`/main/auctions/${id}`}
              className="flex-1 text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              입찰하기
            </Link>
            <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              ♡
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Link 
              href="/login"
              className="inline-block w-full py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              로그인 후 입찰 가능
            </Link>
          </div>
        )}
      </div>
    </li>
  )
}

/* ────────────────────────────────────────── */
/* ② “마퀴 래퍼” – default export              */
/* ────────────────────────────────────────── */
export default function AuctionCard({ auctions }: { auctions: Auction[] }) {
  const trackRef = useRef<HTMLUListElement>(null)

  /* 트랙 길이 계산 → keyframes에서 사용 */
  useEffect(() => {
    const calc = () => {
      if (!trackRef.current) return
      const len =
        Array.from(trackRef.current.children).reduce(
          (s, el) => s + (el as HTMLElement).offsetWidth,
          0,
        ) || 1
      trackRef.current.style.setProperty('--track-len', `${len}px`)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [auctions])

  return (
    <div className="relative overflow-x-auto">
      <ul ref={trackRef} className="auction-track flex gap-2 py-2 select-none">
        {[...auctions, ...auctions].map((a, i) => (
          <AuctionItemCard key={`${a.id}-${i}`} auction={a} />
        ))}
      </ul>

      <style jsx>{`
        .auction-track {
          animation: scroll var(--scroll-time, 30s) linear infinite;
        }
        .auction-track:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(var(--track-len) / -2));
          }
        }
      `}</style>
    </div>
  )
}
