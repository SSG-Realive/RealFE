'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/navigation';

import type { Auction, PaginatedAuctionResponse } from '@/types/customer/auctions';

import ProductImage from '@/components/ProductImage';
import { publicAuctionService } from '@/service/customer/publicAcutionService';
import { useGlobalDialog } from '../context/dialogContext';

export default function AuctionListPage() {
  const router = useRouter();
  const { show } = useGlobalDialog();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const trackRef = useRef<HTMLUListElement>(null);

  const fetchAuctions = async () => {
    try {
      const res: PaginatedAuctionResponse =
          await publicAuctionService.fetchPublicActiveAuctions();

      setAuctions(res.content);

      if (res.content.length === 0) {
        await show('진행 중인 경매가 없습니다.');
      }
    } catch {
      await show('경매 목록을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  // 트랙 길이 계산
  useEffect(() => {
    const calc = () => {
      if (!trackRef.current) return;
      const len =
          Array.from(trackRef.current.children).reduce(
              (sum, el) => sum + (el as HTMLElement).offsetWidth,
              0
          ) || 1;
      trackRef.current.style.setProperty('--track-len', `${len}px`);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [auctions]);

  const timeLeft = (end: string) =>
      formatDistanceToNowStrict(new Date(end), { addSuffix: true });

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-xl font-extrabold mb-6">실시간 경매</h1>

          {/* 슬라이더 트랙 */}
          <div className="relative overflow-x-auto no-scrollbar">
            <ul ref={trackRef} className="auction-track flex gap-4 py-2 select-none">
              {[...auctions, ...auctions].map((a, i) => (
                  <li
                      key={`${a.id}-${i}`}
                      className="w-60 flex-shrink-0"
                      onClick={() => router.push(`/auctions/${a.id}`)}
                  >
                    <div className="rounded-2xl overflow-hidden bg-white shadow hover:shadow-xl transition cursor-pointer">
                      {/* 이미지 */}
                      <div className="relative w-full aspect-square bg-gray-100">
                        <ProductImage
                            src={a.adminProduct?.imageUrl ?? '/default-thumbnail.png'}
                            alt={a.adminProduct?.productName ?? '경매 상품'}
                            className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
                      {timeLeft(a.endTime)}
                    </span>
                      </div>

                      {/* 텍스트 */}
                      <div className="p-4 text-left">
                        <p className="text-base font-medium truncate">
                          {a.adminProduct?.productName}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          시작 {a.startPrice.toLocaleString()}
                          <span className="ml-1 text-xs">원</span>
                        </p>
                        <p className="text-sm font-semibold text-red-500 mt-0.5">
                          현재 {a.currentPrice.toLocaleString()}
                          <span className="ml-1 text-xs">원</span>
                        </p>
                        <p className="text-sm font-semibold text-gray-500 mt-0.5">
                          종료 {new Date(a.endTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
              ))}
            </ul>

            {/* 마퀴 애니메이션 정의 */}
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
        </div>
      </div>
  );
}
