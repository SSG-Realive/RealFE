// src/app/main/seller/[id]/page.tsx
// "use client"; 지시어를 제거하여 서버 컴포넌트로 만듭니다.

import React from 'react';

// DTO 인터페이스 임포트 (기존과 동일)
import { publicSellerInfoResponseDTO } from '@/types/seller/publicSellerInfoResponseDTO';
import { ReviewResponseDTO } from '@/types/reviews/reviewResponseDTO';
import { ProductListDTO } from '@/types/seller/product/product';

// 서비스 함수 임포트 (기존과 동일)
import {
    getSellerPublicInfo,
    getSellerReviews,
    getSellerProducts
} from '@/service/seller/sellerService';

import ClientSellerDetails from './ClientSellerDetails';
import ImageWithFallback from '@/components/common/imageWithFallback';

// -----------------------------------------------------------
// 유틸리티 함수 (기존과 동일)
// -----------------------------------------------------------
const getRatingColor = (rating: number): string => {
    if (rating >= 66.1) return 'bg-green-500';
    if (rating >= 33.1) return 'bg-yellow-400';
    return 'bg-red-500';
};

// -----------------------------------------------------------
// 메인 판매자 상세 페이지 컴포넌트 (서버 컴포넌트)
// -----------------------------------------------------------
interface SellerDetailPageProps {
    params: {
        id: string;
    };
}

export default async function SellerDetailPage({ params }: SellerDetailPageProps) {
    const sellerId = parseInt(params.id, 10);

    if (isNaN(sellerId)) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500 text-xl font-light">
                잘못된 판매자 ID입니다.
            </div>
        );
    }

    const [seller, initialReviewsResponse, initialProductsResponse] = await Promise.all([
        getSellerPublicInfo(sellerId),
        getSellerReviews(sellerId, 0),
        getSellerProducts(sellerId, 0)
    ]);

    if (!seller) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500 text-xl font-light">
                판매자 정보를 찾을 수 없습니다.
            </div>
        );
    }

    const initialReviews = initialReviewsResponse.reviews;
    const initialHasMoreReviews = initialReviewsResponse.hasMore;
    const initialProducts = initialProductsResponse.products;
    const initialHasMoreProducts = initialProductsResponse.hasMore;

    const displayAverageRatingPercentile = (seller.averageRating / 5) * 100;
    const ratingColorClass = getRatingColor(displayAverageRatingPercentile);

    return (
        <div className="container mx-auto p-4 max-w-4xl font-inter antialiased">
            {/* 판매자 헤더 섹션 */}
            <div className="flex items-center space-x-6 mb-8 p-4 bg-white rounded-lg shadow-md">
                <div className="relative w-32 h-32 flex-shrink-0 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                    {/* ⭐ ImageWithFallback 컴포넌트 사용 ⭐ */}
                    <ImageWithFallback
                        src={seller.profileImageUrl}
                        alt="판매자 프로필 이미지"
                        className="w-full h-full object-cover"
                        fallbackSrc="https://placehold.co/128x128/e0e0e0/555555?text=Profile" // 대체 이미지 URL
                    />
                    <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-light ${ratingColorClass} border-2 border-white shadow-lg`}>
                        {displayAverageRatingPercentile.toFixed(0)}%
                    </div>
                </div>

                <div className="flex-grow">
                    <h1 className="text-3xl font-light text-gray-800 mb-2">{seller.name}</h1>
                    <div className="text-gray-600 text-sm mb-1">
                        <span className="font-light">연락처:</span> {seller.contactNumber || '정보 없음'}
                    </div>
                    <div className="text-gray-600 text-sm mb-1">
                        <span className="font-light">사업자 번호:</span> {seller.businessNumber || '정보 없음'}
                    </div>
                    <div className="text-gray-600 text-sm">
                        <span className="font-light">가입일:</span> {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('ko-KR') : '정보 없음'}
                    </div>
                    <div className="text-gray-600 text-sm mt-2">
                        <span className="font-light">총 리뷰 수:</span> {seller.totalReviews}
                    </div>
                </div>
            </div>

            {/* 나머지 동적인 부분은 ClientSellerDetails 컴포넌트로 전달 (기존과 동일) */}
            <ClientSellerDetails
                sellerId={sellerId}
                initialReviews={initialReviews}
                initialHasMoreReviews={initialHasMoreReviews}
                initialProducts={initialProducts}
                initialHasMoreProducts={initialHasMoreProducts}
            />
        </div>
    );
}
