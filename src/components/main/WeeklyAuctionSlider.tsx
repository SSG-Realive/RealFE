'use client';

import { useAuctionStore } from '@/store/customer/auctionStore';
import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import Slider from 'react-slick';

export default function WeeklyAuctionSlider() {
  const { auctions, fetchAuctions } = useAuctionStore();
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    if (auctions.length === 0) fetchAuctions();
  }, [fetchAuctions, auctions.length]);

  // 최신 순으로 10개 정렬
  const sorted = useMemo(() => {
    return [...auctions]
        .filter((a) => a.createdAt)
        .sort(
            (a, b) =>
                new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        )
        .slice(0, 10);
  }, [auctions]);

  const settings = {
    infinite: true,
    speed: 700,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    dots: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
      <section className="relative px-4 sm:mt-14 mt-1">
        <h2 className="text-xl font-bold text-center mb-6">금주의 옥션상품</h2>

        <Slider ref={sliderRef} {...settings}>
          {sorted.map((auction, index) => (
              <div key={`${auction.id}-${index}`} className="px-2">
                <div className="w-full max-w-[250px] mx-auto aspect-square rounded-lg shadow overflow-hidden bg-gray-100">
                  <Link href={`/auctions/${auction.id}`}>
                    <img
                        src={
                            auction.adminProduct?.imageUrl || '/images/placeholder.png'
                        }
                        alt={auction.adminProduct?.productName || '상품 이미지'}
                        className="object-contain w-full h-full"
                    />
                  </Link>
                </div>
                <p className="text-sm text-center mt-1 truncate">
                  {auction.adminProduct?.productName || '상품 없음'}
                </p>
              </div>
          ))}
        </Slider>

        {/* 왼쪽 화살표 */}
        <button
            onClick={() => sliderRef.current?.slickPrev()}
            className="absolute z-10 top-[50%] left-2 -translate-y-1/2 text-3xl bg-white shadow rounded-full p-2 hover:scale-110 transition"
            type="button"
        >
          &#10094;
        </button>

        {/* 오른쪽 화살표 */}
        <button
            onClick={() => sliderRef.current?.slickNext()}
            className="absolute z-10 top-[50%] right-2 -translate-y-1/2 text-3xl bg-white shadow rounded-full p-2 hover:scale-110 transition"
            type="button"
        >
          &#10095;
        </button>

        <style jsx global>{`
        @media (max-width: 767px) {
          button {
            display: none;
          }
        }
        .slick-track {
          display: flex !important;
        }
        .slick-slide {
          display: flex !important;
          justify-content: center;
        }
      `}</style>
      </section>
  );
}
