'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/navigation';

import { Flame, Clock, Sparkles } from 'lucide-react';

import type { Auction, PaginatedAuctionResponse } from '@/types/customer/auctions';
import ProductImage from '@/components/ProductImage';
import { publicAuctionService } from '@/service/customer/publicAuctionService';
import { useGlobalDialog } from '../context/dialogContext';

export default function AuctionListPage() {
  
  const router = useRouter();
  const { show } = useGlobalDialog();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const trackRef1 = useRef<HTMLUListElement>(null);
  const trackRef2 = useRef<HTMLUListElement>(null);
  const trackRef3 = useRef<HTMLUListElement>(null);
  const trackRef4 = useRef<HTMLUListElement>(null);

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

  const timeLeft = (end: string) =>
      formatDistanceToNowStrict(new Date(end), { addSuffix: true });

  const setupTrack = (ref: React.Ref<HTMLUListElement>) => {
  // ✅ [수정] ref가 함수이거나 null이면 아무것도 하지 않고 종료하는 코드
  if (typeof ref === 'function' || !ref) return;

  // 이 아래부터는 ref가 .current 속성을 가진 객체임이 보장됩니다.
  if (!ref.current) return;
  const len =
    Array.from(ref.current.children).reduce(
      (sum, el) => sum + (el as HTMLElement).offsetWidth,
      0
    ) || 1;
  ref.current.style.setProperty('--track-len', `${len}px`);
};

  useEffect(() => {
    const resizeHandler = () => {
      setupTrack(trackRef1);
      setupTrack(trackRef2);
      setupTrack(trackRef3);
      setupTrack(trackRef4);
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, [auctions]);

  const renderSlider = (title: string, trackRef: React.Ref<HTMLUListElement>) => {
    const iconMap: Record<string, JSX.Element> = {
      '실시간 경매': <Flame className="text-indigo-500" size={20} />,
      '인기 경매': <Flame className="text-red-500" size={20} />,
      '마감 임박 경매': <Clock className="text-yellow-500" size={20} />,
      '신규 경매': <Sparkles className="text-green-500" size={20} />,
    };

    return (
        <section className="mb-10">
          <h2 className="text-xl font-light mb-4 flex items-center gap-2">
            {iconMap[title] ?? null}
            {title}
          </h2>
          <div className="relative overflow-x-auto no-scrollbar">
            <ul ref={trackRef} className="auction-track flex gap-4 py-2 select-none">
              {[...auctions, ...auctions].map((a, i) => (
                  <li
                      key={`${title}-${a.id}-${i}`}
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
                        <p className="text-base font-light truncate">
                          {a.adminProduct?.productName}
                        </p>
                        <p className="text-sm font-light text-gray-900 mt-1">
                          시작 {a.startPrice.toLocaleString()}
                          <span className="ml-1 text-xs">원</span>
                        </p>
                        <p className="text-sm font-light text-red-500 mt-0.5">
                          현재 {a.currentPrice.toLocaleString()}
                          <span className="ml-1 text-xs">원</span>
                        </p>
                        <p className="text-sm font-light text-gray-500 mt-0.5">
                          종료 {new Date(a.endTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
              ))}
            </ul>

            {/* 슬라이드 애니메이션 */}
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
        </section>
    );
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {renderSlider('실시간 경매', trackRef1)}
          {renderSlider('인기 경매', trackRef2)}
          {renderSlider('마감 임박 경매', trackRef3)}
          {renderSlider('신규 경매', trackRef4)}
        </div>
      </div>
  );
}
