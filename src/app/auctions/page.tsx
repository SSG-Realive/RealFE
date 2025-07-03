'use client';

import { useEffect, useState } from 'react';
// ❌ 아이콘 import 제거
import { useRouter } from 'next/navigation';
import { publicAuctionService } from '@/service/customer/publicAuctionService';
import ProductImage from '@/components/ProductImage';
import type { Auction } from '@/types/customer/auctions';

const TAB_LIST = [
  { key: 'live', label: '실시간' },
  { key: 'popular', label: '인기' },
  { key: 'ending', label: '마감 임박' },
];

export default function AuctionPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'popular' | 'ending'>('live');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let result;
        if (activeTab === 'live') {
          result = await publicAuctionService.fetchPublicActiveAuctions();
        } else if (activeTab === 'popular') {
          result = await publicAuctionService.fetchPopularAuctions(); // 가정
        } else {
          result = await publicAuctionService.fetchEndingSoonAuctions(); // 가정
        }
        setAuctions(result.content);
      } catch (e) {
        console.error('경매 목록 불러오기 실패', e);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 탭 */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          {TAB_LIST.map((tab) => (
              <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-2 px-2 text-sm font-medium ${
                      activeTab === tab.key
                          ? 'border-b-2 border-black text-black'
                          : 'text-gray-400 hover:text-black'
                  }`}
              >
                {tab.label}
              </button>
          ))}
        </div>

        {/* 카드 목록 */}
        <div className="mt-16 grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {auctions.map((a) => (
              <div
                  key={a.id}
                  onClick={() => router.push(`/auctions/${a.id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition overflow-hidden"
              >
                <div className="relative aspect-square bg-gray-100">
                  <ProductImage
                      src={a.adminProduct?.imageUrl ?? '/default-thumbnail.png'}
                      alt={a.adminProduct?.productName ?? '경매 상품'}
                      className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 text-sm">
                  <p className="truncate text-gray-800">{a.adminProduct?.productName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    시작가 {a.startPrice.toLocaleString()}원
                  </p>
                  <p className="text-sm text-black-500">
                    현재가 {a.currentPrice.toLocaleString()}원
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    종료일 {new Date(a.endTime).toLocaleDateString()} {new Date(a.endTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
          ))}
        </div>

      </div>
  );
}
