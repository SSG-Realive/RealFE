'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SellerLayout from '@/components/layouts/SellerLayout';
import SellerHeader from '@/components/seller/SellerHeader';
import TrafficLightStatusCard from '@/components/seller/TrafficLightStatusCard';
import { getSellerReviews, getSellerReviewStatistics } from '@/service/seller/reviewService';
import { SellerReviewResponse, SellerReviewListResponse, SellerReviewStatistics, ReviewFilterOptions } from '@/types/seller/review';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { 
    MessageSquare, 
    TrendingUp, 
    Filter,
    Search,
    RefreshCw,
    Eye,
    Calendar,
    User,
    Package,
    Image as ImageIcon,
    Circle
} from 'lucide-react';

export default function SellerReviewPage() {
    const checking = useSellerAuthGuard();
    const router = useRouter();
    
    // 상태 관리
    const [reviews, setReviews] = useState<SellerReviewResponse[]>([]);
    const [statistics, setStatistics] = useState<SellerReviewStatistics | null>(null);
    const [selectedReview, setSelectedReview] = useState<SellerReviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // 필터링 상태
    const [filterProductName, setFilterProductName] = useState('');
    const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'rating_high' | 'rating_low'>('latest');
    
    // 페이징 상태
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // 데이터 조회
    const fetchReviews = async () => {
        try {
            setLoading(true);
            const filters: ReviewFilterOptions = {
                productName: filterProductName || undefined,
                rating: filterRating,
                sortBy: sortBy
            };
            
            const [reviewsData, statsData] = await Promise.all([
                getSellerReviews(currentPage, pageSize, filters),
                getSellerReviewStatistics()
            ]);
            
            setReviews(reviewsData.reviews);
            setTotalCount(reviewsData.totalCount);
            setStatistics(statsData);
            setError(null);
        } catch (err) {
            console.error('리뷰 데이터 조회 실패:', err);
            setError('리뷰 데이터를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [currentPage, filterProductName, filterRating, sortBy]);

    // 필터 초기화
    const resetFilters = () => {
        setFilterProductName('');
        setFilterRating(undefined);
        setSortBy('latest');
        setCurrentPage(0);
    };

    // 신호등 색상 반환 (대시보드와 동일한 규칙)
    const getTrafficLightColor = (rating: number) => {
        if (rating === 0) return '#d1d5db'; // 회색 (평가없음)
        if (rating >= 0.1 && rating <= 2.0) return '#ef4444'; // 빨강 (0.1~2.0)
        if (rating >= 2.1 && rating <= 3.5) return '#facc15'; // 노랑 (2.1~3.5)
        if (rating >= 3.6 && rating <= 5.0) return '#22c55e'; // 초록 (3.6~5.0)
        return '#d1d5db'; // 회색 (예외 상황)
    };

    // 평점 텍스트 반환 (대시보드와 동일한 규칙)
    const getRatingText = (rating: number) => {
        if (rating === 0) return '평가없음';
        if (rating === 5.0) return '최고'; // 완벽한 5점
        if (rating >= 0.1 && rating <= 2.0) return '부정적'; // 빨강 구간
        if (rating >= 2.1 && rating <= 3.5) return '보통'; // 노랑 구간
        if (rating >= 3.6 && rating < 5.0) return '긍정적'; // 초록 구간
        return '평가없음'; // 예외 상황
    };

    // 날짜 포맷팅
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (checking || loading) {
        return (
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a89f91] mx-auto mb-4"></div>
                    <p className="text-[#5b4636]">리뷰 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="hidden">
                <SellerHeader toggleSidebar={toggleSidebar} />
            </div>
            <SellerLayout>
                <div className="flex-1 w-full h-full px-4 py-8">
                    {/* 헤더 */}
                    <div className="mb-6">
                        <h1 className="text-xl md:text-2xl font-bold text-[#374151]">고객 피드백 관리</h1>
                        <p className="text-sm text-[#6b7280] mt-1">
                            고객들이 남긴 리뷰를 확인하고 관리하세요
                        </p>
                    </div>

                    {/* 통계 카드 - 신호등 사용 */}
                    {statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <TrafficLightStatusCard
                                title="전체 평점"
                                rating={statistics.averageRating}
                                count={statistics.totalReviews}
                            />
                            
                            <div className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px]">
                                <div className="flex items-center gap-3 mb-2">
                                    <MessageSquare className="w-8 h-8 text-blue-600" />
                                    <span className="text-[#374151] text-sm font-semibold">총 리뷰</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{statistics.totalReviews}개</div>
                            </div>

                            <div className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px]">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                    <span className="text-[#374151] text-sm font-semibold">5점 리뷰</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{statistics.rating5Count}개</div>
                                <div className="text-xs text-[#6b7280]">
                                    {statistics.totalReviews > 0 ? ((statistics.rating5Count / statistics.totalReviews) * 100).toFixed(1) : 0}%
                                </div>
                            </div>

                            <div className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px]">
                                <div className="flex items-center gap-3 mb-2">
                                    <Circle className="w-8 h-8 text-red-500" />
                                    <span className="text-[#374151] text-sm font-semibold">낮은 평점</span>
                                </div>
                                <div className="text-2xl font-bold text-red-500">
                                    {statistics.rating1Count + statistics.rating2Count}개
                                </div>
                                <div className="text-xs text-[#6b7280]">1-2점 리뷰</div>
                            </div>
                        </div>
                    )}

                    {/* 필터 섹션 */}
                    <div className="bg-[#f3f4f6] p-4 rounded-lg shadow-sm border-2 border-[#d1d5db] mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-[#6b7280]" />
                            <h3 className="text-[#374151] font-semibold">필터 옵션</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* 상품명 필터 */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">상품명</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                                    <input
                                        type="text"
                                        value={filterProductName}
                                        onChange={(e) => setFilterProductName(e.target.value)}
                                        placeholder="상품명 검색"
                                        className="w-full pl-10 pr-3 py-2 border border-[#d1d5db] rounded-md focus:ring-2 focus:ring-[#a89f91] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* 평점 필터 */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">평점</label>
                                <select
                                    value={filterRating || ''}
                                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-md focus:ring-2 focus:ring-[#a89f91] focus:border-transparent"
                                >
                                    <option value="">전체</option>
                                    <option value="5">5점</option>
                                    <option value="4">4점</option>
                                    <option value="3">3점</option>
                                    <option value="2">2점</option>
                                    <option value="1">1점</option>
                                </select>
                            </div>

                            {/* 정렬 */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">정렬</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-md focus:ring-2 focus:ring-[#a89f91] focus:border-transparent"
                                >
                                    <option value="latest">최신순</option>
                                    <option value="oldest">오래된순</option>
                                    <option value="rating_high">평점 높은순</option>
                                    <option value="rating_low">평점 낮은순</option>
                                </select>
                            </div>

                            {/* 버튼 */}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={resetFilters}
                                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                                >
                                    초기화
                                </button>
                                <button
                                    onClick={fetchReviews}
                                    className="flex items-center gap-2 bg-[#a89f91] text-white px-4 py-2 rounded-md hover:bg-[#9a8a7a] transition-colors text-sm"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    새로고침
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 리뷰 목록 */}
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#f3f4f6] rounded-lg shadow-sm border border-[#d1d5db]">
                            <table className="min-w-full divide-y divide-[#d1d5db]">
                                <thead className="bg-[#f3f4f6]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">고객정보</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상품명</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">평점</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">리뷰내용</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">작성일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상세보기</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                                    {reviews.map((review) => (
                                        <tr key={review.reviewId} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#374151]">고객 {review.customerId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#374151] max-w-xs truncate">
                                                        {review.productName || '상품명 없음'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Circle 
                                                        className="w-4 h-4" 
                                                        style={{ color: getTrafficLightColor(review.rating) }}
                                                        fill="currentColor"
                                                    />
                                                    <span className="text-sm font-medium text-[#374151]">
                                                        {review.rating.toFixed(1)} ({getRatingText(review.rating)})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <p className="text-sm text-[#374151] line-clamp-2">
                                                        {review.content}
                                                    </p>
                                                    {review.imageUrls && review.imageUrls.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <ImageIcon className="w-3 h-3 text-[#6b7280]" />
                                                            <span className="text-xs text-[#6b7280]">
                                                                이미지 {review.imageUrls.length}개
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#374151]">
                                                        {formatDate(review.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="inline-flex items-center gap-1 bg-[#d1d5db] text-[#374151] px-3 py-1.5 rounded hover:bg-[#e5e7eb] hover:text-[#374151] text-sm transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> 상세 보기
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* 페이징 */}
                            {totalCount > pageSize && (
                                <div className="bg-white px-6 py-3 border-t border-[#d1d5db] flex items-center justify-between">
                                    <div className="text-sm text-[#6b7280]">
                                        총 {totalCount}개 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalCount)}개 표시
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                            disabled={currentPage === 0}
                                            className="px-3 py-1 text-sm border border-[#d1d5db] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            이전
                                        </button>
                                        <span className="px-3 py-1 text-sm text-[#374151]">
                                            {currentPage + 1} / {Math.ceil(totalCount / pageSize)}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / pageSize) - 1, currentPage + 1))}
                                            disabled={currentPage >= Math.ceil(totalCount / pageSize) - 1}
                                            className="px-3 py-1 text-sm border border-[#d1d5db] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            다음
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 리뷰 상세 모달 */}
                    {selectedReview && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-[#374151]">리뷰 상세 정보</h3>
                                    <button
                                        onClick={() => setSelectedReview(null)}
                                        className="text-[#374151] hover:text-[#b94a48] text-2xl"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* 기본 정보 */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#374151] mb-1">고객 ID</label>
                                            <p className="text-[#374151]">{selectedReview.customerId}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#374151] mb-1">주문 ID</label>
                                            <p className="text-[#374151]">{selectedReview.orderId}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-1">상품명</label>
                                        <p className="text-[#374151]">{selectedReview.productName || '상품명 없음'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-1">평점</label>
                                        <div className="flex items-center gap-3">
                                            <Circle 
                                                className="w-6 h-6" 
                                                style={{ color: getTrafficLightColor(selectedReview.rating) }}
                                                fill="currentColor"
                                            />
                                            <span className="text-lg font-bold text-[#374151]">
                                                {selectedReview.rating.toFixed(1)}점 ({getRatingText(selectedReview.rating)})
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-1">리뷰 내용</label>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-[#374151] whitespace-pre-wrap">{selectedReview.content}</p>
                                        </div>
                                    </div>

                                    {/* 이미지 */}
                                    {selectedReview.imageUrls && selectedReview.imageUrls.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-[#374151] mb-2">첨부 이미지</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedReview.imageUrls.map((url, index) => (
                                                    <img
                                                        key={index}
                                                        src={url}
                                                        alt={`리뷰 이미지 ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-1">작성일</label>
                                        <p className="text-[#374151]">{formatDate(selectedReview.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </>
    );
} 