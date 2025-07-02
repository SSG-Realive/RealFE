'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchReviewDetail, deleteReview } from '@/service/customer/reviewService';
import { ReviewResponseDTO } from '@/types/customer/review/review';
import Navbar from '@/components/customer/common/Navbar';
import Link from 'next/link';
import {
    getTrafficLightEmoji,
    getTrafficLightText,
    getTrafficLightBgClass
} from '@/types/admin/review';

export default function ReviewDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [review, setReview] = useState<ReviewResponseDTO | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        fetchReviewDetail(Number(id))
            .then(setReview)
            .catch(() => setError('리뷰 정보를 불러오지 못했습니다.'));
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteReview(Number(id));
            alert('리뷰가 삭제되었습니다.');
            router.push('/customer/mypage/reviews'); // 목록 페이지로 이동
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

    if (error) return <div className="text-red-500">{error}</div>;
    if (!review) return <div>로딩 중...</div>;

    return (
        <div>
            {/* <Navbar /> */}

            <div className="max-w-2xl mx-auto px-6 py-10 bg-teal-50">
                {/* 상단 얇은 선 + 판매자 정보 */}
                <div className="relative mb-5">
                    <hr className="border-t border-gray-200" />
                    <div className="absolute -top-3 left-0 flex items-center space-x-1 bg-teal-50 px-2 text-sm text-gray-600">
                        <span>🏠</span>
                        <span>판매자 {review.sellerId}</span>
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-2">{review.productName}</h1>
                <div className="flex justify-end items-center mb-2">
                    {/* 별점 아이콘 + 점수 (왼쪽) */}
                    {/* <div className="flex items-center space-x-1 text-yellow-400">
                        {Array.from({ length: 5 }, (_, i) => (
                        <span key={i}>{i < Math.floor(review.rating) ? '★' : '☆'}</span>
                        ))}
                        <p className="text-yellow-500">{review.rating}</p>
                    </div> */}

                    {/* 신호등 평가 (오른쪽) */}
                    <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getTrafficLightBgClass(
                        review.rating
                        )} bg-white`}
                    >
                        <span className="text-base">{getTrafficLightEmoji(review.rating)}</span>
                        <span className="text-xs text-gray-700">{getTrafficLightText(review.rating)}</span>
                    </div>
                </div>

                <p className="text-gray-700 whitespace-pre-line mt-4">{review.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>

                {/* 이미지들 */}
                {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {review.imageUrls.map((url, idx) => (
                            <img
                                key={idx}
                                src={url}
                                alt={`리뷰 이미지 ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded"
                            />
                        ))}
                    </div>
                )}

                {/* 관련 상품 섹션 */}
                {review.productSummaryList && review.productSummaryList.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-xl font-semibold mb-4">구매한 상품 목록</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {review.productSummaryList.map(product => (
                                <Link
                                    key={product.id}
                                    href={`/main/products/${product.id}`}
                                    className="block border rounded-lg shadow-sm p-2 bg-white hover:shadow-md transition-shadow"
                                >
                                    <img
                                        src={product.imageThumbnailUrl}
                                        alt={product.name}
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                    <p className="text-sm text-gray-700 text-center">{product.name}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 버튼 영역 */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={() => router.push(`/customer/mypage/reviews/${id}/edit`)}
                        className="px-4 py-2 bg-blue-900  text-white rounded hover:bg-blue-600"
                    >
                        수정
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-rose-900 text-white rounded hover:bg-red-600"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}
