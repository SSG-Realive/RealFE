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
