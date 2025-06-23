'use client';

import Slider from 'react-slick';
import Link from 'next/link';
import { useAuctionStore } from '@/store/customer/auctionStore';
import { useEffect, useRef, useState } from 'react';

export default function WeeklyAuctionSlider() {
  const { auctions, fetchAuctions } = useAuctionStore();
  const sliderRef = useRef<Slider>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(5);

  // 1. 경매 목록 로딩 및 반응형 slidesToShow 설정
  useEffect(() => {
    if (auctions.length === 0) {
      fetchAuctions();
    }

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setSlidesToShow(1);
      else if (width < 1024) setSlidesToShow(3);
      else setSlidesToShow(5);
    };

    handleResize(); // 최초 한 번
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchAuctions, auctions.length]);

  // 2. 실제 슬라이드 중심 추적
  useEffect(() => {
    const interval = setInterval(() => {
      const current = sliderRef.current?.innerSlider?.state?.currentSlide ?? 0;
      const calculatedCenter =
        (current + Math.floor(slidesToShow / 2)) % (auctions.length || 1);
      setCenterIndex(calculatedCenter);
    }, 100);

    return () => clearInterval(interval);
  }, [slidesToShow, auctions.length]);

  // 3. 정렬된 옥션 목록
  const sorted = [...auctions]
    .filter((a) => a.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    )
    .slice(0, 10);

  // 4. 슬라이더 설정
  const settings = {
    infinite: true,
    speed: 700,
    cssEase: 'ease-in-out',
    centerMode: true,
    centerPadding: '0px',
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false,
    dots: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="relative px-4 mt-14">
      <h2 className="text-xl font-bold text-center mb-6">금주의 옥션상품</h2>

      <div className="relative">
        <Slider ref={sliderRef} {...settings}>
          {sorted.map((auction, index) => {
            const isCenter = index === centerIndex;

            return (
              <div key={`${auction.id}-${index}`} className="px-2">
                <div
                  className={`realive-auction-slide ${
                    isCenter ? 'active-center-style' : ''
                  }`}
                >
                  <Link href={`/auctions/${auction.id}`}>
                    <div className="w-full aspect-w-16 aspect-h-9 rounded-lg shadow overflow-hidden bg-gray-100">
                      <img
                        src={
                          auction.adminProduct?.imageUrl ||
                          '/images/placeholder.png'
                        }
                        alt={
                          auction.adminProduct?.productName || '상품 이미지'
                        }
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </Link>
                  <p className="text-sm text-center mt-1 truncate">
                    {auction.adminProduct?.productName || '상품 없음'}
                  </p>
                </div>
              </div>
            );
          })}
        </Slider>

        {/* 왼쪽 화살표 */}
        <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="absolute z-10 top-[50%] left-[20%] -translate-y-1/2 text-3xl bg-white shadow rounded-full p-2 hover:scale-110 transition"
          type="button"
        >
          &#10094;
        </button>

        {/* 오른쪽 화살표 */}
        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="absolute z-10 top-[50%] right-[20%] -translate-y-1/2 text-3xl bg-white shadow rounded-full p-2 hover:scale-110 transition"
          type="button"
        >
          &#10095;
        </button>
      </div>

      <style jsx global>{`
        .realive-auction-slide {
          transition: transform 0.4s ease, filter 0.4s ease;
          transform: scale(0.9);
          filter: brightness(0.92);
          opacity: 0.7;
        }

        .active-center-style {
          transform: scale(1.05);
          filter: brightness(1);
          opacity: 1;
          z-index: 2;
        }
      `}</style>
    </section>
  );
}
