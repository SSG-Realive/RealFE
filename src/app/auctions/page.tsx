// app/auctions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';


import type { Auction, PaginatedAuctionResponse } from '@/types/customer/auctions';

import ProductImage from '@/components/ProductImage';
   // ⬅️ 전역 다이얼로그
import { publicAuctionService } from '@/service/customer/publicAcutionService';
import { useGlobalDialog } from '../context/dialogContext';
import Footer from "@/components/customer/common/Footer";

const PAGE_SIZE = 10; // 백엔드 size 고정

export default function AuctionListPage() {
  const router = useRouter();
  const { show } = useGlobalDialog();          // ⬅️ 모달 호출 함수

  /* ───────── state ───────── */
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ───────── fetch ───────── */
  const fetchPage = async (pageNumber: number) => {
    setLoading(true);
    try {
      // ※ 현재 백엔드 API는 page 파라미터를 지원하지 않는다고 가정
      const res: PaginatedAuctionResponse =
        await publicAuctionService.fetchPublicActiveAuctions();

      setAuctions(prev =>
        pageNumber === 0 ? res.content : [...prev, ...res.content],
      );
      setPage(res.number);
      setLastPage(res.last);

      if (res.content.length === 0) {
        await show('진행 중인 경매가 없습니다.');
      }
    } catch {
      await show('경매 목록을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(0);
  }, []);

  /* ───────── util ───────── */
  const timeLeft = (end: string) =>
    formatDistanceToNowStrict(new Date(end), { addSuffix: true });

  /* ───────── render ───────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-8">실시간 경매</h1>

        {/* 경매 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {auctions.map(a => (
            <div
              key={a.id}
              onClick={() => router.push(`/auctions/${a.id}`)}
              className="cursor-pointer rounded-2xl overflow-hidden bg-white
                         shadow-lg hover:shadow-xl transition-shadow group"
            >
              <div className="relative w-full aspect-square bg-gray-100">
                <ProductImage
                  src={a.adminProduct?.imageUrl ?? '/default-thumbnail.png'}
                  alt={a.adminProduct?.productName ?? '경매 상품'}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-black/80 text-white
                                 text-xs px-2 py-1 rounded-full">
                  {timeLeft(a.endTime)}
                </span>
              </div>

              <div className="p-4">
                <p className="font-semibold truncate">
                  {a.adminProduct?.productName}
                </p>
                <p className="text-sm text-gray-500">
                  시작 {a.startPrice.toLocaleString()}원
                </p>
                <p className="text-lg font-bold text-indigo-600">
                  현재 {a.currentPrice.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 더보기 */}
        {!lastPage && (
          <div className="text-center mt-10">
            <button
              onClick={() => fetchPage(page + 1)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-6 py-3 rounded-full
                         border border-gray-300 bg-white hover:bg-gray-100
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '불러오는 중…' : '더보기'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
