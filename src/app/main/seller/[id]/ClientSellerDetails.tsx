// src/app/main/seller/[id]/ClientSellerDetails.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link'; // ⭐ Link 컴포넌트 임포트 ⭐

// DTO 인터페이스 임포트 (기존과 동일)
import { ReviewResponseDTO } from '@/types/reviews/reviewResponseDTO';
import { ProductListDTO } from '@/types/seller/product/product';

// 서비스 함수 임포트 (기존과 동일)
import {
    getSellerReviews as fetchSellerReviewsService,
    getSellerProducts as fetchSellerProductsService
} from '@/service/seller/sellerService';

// ImageWithFallback 컴포넌트 임포트 (기존과 동일)
import ImageWithFallback from '@/components/common/imageWithFallback';

interface ClientSellerDetailsProps {
    sellerId: number;
    initialReviews: ReviewResponseDTO[] | null;
    initialHasMoreReviews: boolean;
    initialProducts: ProductListDTO[] | null;
    initialHasMoreProducts: boolean;
}

// ⭐ 리뷰 내용을 간략하게 표시하기 위한 최대 길이 설정 ⭐
const REVIEW_SUMMARY_LENGTH = 100;

export default function ClientSellerDetails({
                                                sellerId,
                                                initialReviews,
                                                initialHasMoreReviews,
                                                initialProducts,
                                                initialHasMoreProducts
                                            }: ClientSellerDetailsProps) {
    const [reviews, setReviews] = useState<ReviewResponseDTO[]>(initialReviews || []);
    const [products, setProducts] = useState<ProductListDTO[]>(initialProducts || []);

    const [reviewPage, setReviewPage] = useState<number>(1);
    const [productPage, setProductPage] = useState<number>(1);

    const [hasMoreReviews, setHasMoreReviews] = useState<boolean>(initialHasMoreReviews);
    const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(initialHasMoreProducts);

    const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    // ⭐ 각 리뷰의 전체 내용 표시 여부를 관리하는 상태 ⭐
    const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

    const toggleReviewExpansion = (reviewId: number) => {
        setExpandedReviews(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };

    const loadMoreReviews = useCallback(async () => {
        if (loadingReviews || !hasMoreReviews) return;
        setLoadingReviews(true);
        try {
            const { reviews: newReviews, hasMore: newHasMoreReviews } = await fetchSellerReviewsService(sellerId, reviewPage);
            setReviews(prevReviews => [...prevReviews, ...newReviews]);
            setHasMoreReviews(newHasMoreReviews);
            setReviewPage(prevPage => prevPage + 1);
        } catch (error) {
            console.error("판매자 리뷰 추가 로드 실패:", error);
        } finally {
            setLoadingReviews(false);
        }
    }, [sellerId, reviewPage, loadingReviews, hasMoreReviews]);

    const loadMoreProducts = useCallback(async () => {
        if (loadingProducts || !hasMoreProducts) return;
        setLoadingProducts(true);
        try {
            const { products: newProducts, hasMore: newHasMoreProducts } = await fetchSellerProductsService(sellerId, productPage);
            setProducts(prevProducts => [...prevProducts, ...newProducts]);
            setHasMoreProducts(newHasMoreProducts);
            setProductPage(prevPage => prevPage + 1);
        } catch (error) {
            console.error("판매자 상품 추가 로드 실패:", error);
        } finally {
            setLoadingProducts(false);
        }
    }, [sellerId, productPage, loadingProducts, hasMoreProducts]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (hasMoreReviews) {
                        loadMoreReviews();
                    }
                    if (hasMoreProducts) {
                        loadMoreProducts();
                    }
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadMoreReviews, loadMoreProducts, hasMoreReviews, hasMoreProducts]);

    return (
        <>
            {/* 판매자 리뷰 섹션 */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-light text-gray-800 mb-4 border-b pb-2">판매자 리뷰</h2>
                {reviews.length === 0 && !loadingReviews ? (
                    <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((review) => {
                            const isExpanded = expandedReviews[review.reviewId];
                            const displayContent = isExpanded
                                ? review.content
                                : (review.content && review.content.length > REVIEW_SUMMARY_LENGTH
                                    ? review.content.substring(0, REVIEW_SUMMARY_LENGTH) + '...'
                                    : review.content);

                            return (
                                <div key={review.reviewId} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex items-center mb-2">
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-5 h-5 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.292a1 1 0 00.95.69h3.46c.969 0 1.371 1.24.588 1.81l-2.793 2.03.882 3.291c.269 1.003-.836 1.772-1.611 1.144L10 14.073l-2.793 2.03c-.775.628-1.88-.141-1.611-1.144l.882-3.292-2.793-2.03c-.783-.57-.38-1.81.588-1.81h3.46a1 1 0 00.95-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="ml-2 text-gray-700 text-sm font-light">({review.rating}/5)</span>
                                        <span className="ml-2 text-gray-700 text-xs">{review.productName}</span>
                                    </div>
                                    <p className="text-gray-800 text-sm mb-2">
                                        {displayContent}
                                        {review.content && review.content.length > REVIEW_SUMMARY_LENGTH && (
                                            <button
                                                onClick={() => toggleReviewExpansion(review.reviewId)}
                                                className="text-blue-600 hover:underline ml-1 text-xs"
                                            >
                                                {isExpanded ? '간략히' : '더보기'}
                                            </button>
                                        )}
                                    </p>
                                    {review.imageUrls && Array.isArray(review.imageUrls) && review.imageUrls.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {review.imageUrls.map((imageUrl, idx) => (
                                                <ImageWithFallback
                                                    key={idx}
                                                    src={imageUrl}
                                                    alt={`리뷰 이미지 ${idx + 1}`}
                                                    className="w-16 h-16 object-cover rounded-md"
                                                    fallbackSrc="/images/placeholder.jpg"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-gray-500 text-xs flex justify-between">
                                        <span>고객 ID: {review.customerId}</span>
                                        <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : ''}</span>
                                    </div>
                                    {review.isHidden && (
                                        <span className="text-red-500 text-xs mt-1"> (숨김 처리된 리뷰)</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* 리뷰 로딩 중 표시 */}
                {loadingReviews && (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                )}
                {/* 더 이상 리뷰가 없을 때 메시지 표시 */}
                {!hasMoreReviews && reviews.length > 0 && (
                    <p className="text-center text-gray-500 text-sm mt-4">더 이상 리뷰가 없습니다.</p>
                )}
            </div>

            {/* 판매자 상품 목록 섹션 */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-light text-gray-800 mb-4 border-b pb-2">판매자 상품 목록</h2>
                {products.length === 0 && !loadingProducts ? (
                    <p className="text-gray-500">등록된 상품이 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                            // ⭐ 상품 클릭 시 상세 페이지로 이동하도록 Link 컴포넌트로 감쌈 ⭐
                            <Link
                                key={product.id}
                                href={`/main/products/${product.id}`} // 상품 상세 페이지 URL (예시)
                                className="block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <ImageWithFallback
                                    src={product.imageThumbnailUrl}
                                    alt={product.name || '상품 이미지'}
                                    className="w-full h-48 object-cover"
                                    fallbackSrc={`https://placehold.co/400x300/e0e0e0/555555?text=${product.name || 'Product'}`}
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-light text-gray-900 mb-1 line-clamp-2">{product.name || '상품명 없음'}</h3>
                                    <p className="text-gray-700 text-base font-light mb-2">
                                        {product.price ? product.price.toLocaleString('ko-KR') + '원' : '가격 정보 없음'}
                                    </p>
                                    <p className="text-gray-600 text-sm">재고: {product.stock}</p>
                                    <p className="text-gray-600 text-sm">상태: {product.status}</p>
                                    <p className="text-gray-600 text-sm">카테고리: {product.categoryName}</p>
                                    {product.parentCategoryName && <p className="text-gray-600 text-sm">상위 카테고리: {product.parentCategoryName}</p>}
                                    <p className="text-gray-600 text-sm">판매자: {product.sellerName}</p>
                                    <p className="text-gray-600 text-sm">활성화: {product.isActive ? '판매중' : '판매중지'}</p>
                                    <p className="text-gray-600 text-sm">위시리스트: {product.isWished ? '추가됨' : '미추가'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                {/* 상품 로딩 중 표시 */}
                {loadingProducts && (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                )}
                {/* 더 이상 상품이 없을 때 메시지 표시 */}
                {!hasMoreProducts && products.length > 0 && (
                    <p className="text-center text-gray-500 text-sm mt-4">더 이상 상품이 없습니다.</p>
                )}
            </div>

            {/* Intersection Observer 대상 요소 (무한 스크롤 트리거) */}
            <div ref={observerTarget} className="h-4 w-full bg-transparent"></div>
        </>
    );
}