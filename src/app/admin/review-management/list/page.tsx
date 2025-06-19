"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminReviewList } from "@/service/admin/reviewService";
import { AdminReview, AdminReviewListRequest } from "@/types/admin/review";
import { useAdminAuthStore } from "@/store/admin/useAdminAuthStore";

export default function ReviewListPage() {
  const router = useRouter();
  const { accessToken } = useAdminAuthStore();
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customerFilter, setCustomerFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");

  // 로그인 체크
  useEffect(() => {
    if (!accessToken) {
      router.replace('/admin/login');
    }
  }, [accessToken, router]);

  // 리뷰 목록 조회
  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: AdminReviewListRequest = {
        page: page - 1,
        size: 10,
        productFilter: search || undefined,
        customerFilter: customerFilter || undefined,
        sellerFilter: sellerFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await getAdminReviewList(params);
      setReviews(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('리뷰 목록 조회 실패:', err);
      setError(err.message || '리뷰 목록을 불러오는데 실패했습니다.');
      if (err.response?.status === 403) {
        router.replace('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    if (accessToken) {
      fetchReviews();
    }
  }, [accessToken]);

  // 검색 및 필터 적용
  const handleSearch = () => {
    fetchReviews(1);
  };

  if (!accessToken) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600 text-center mb-4">{error}</div>
        <button 
          onClick={() => fetchReviews()} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">리뷰 목록</h1>
      
      {/* 검색 및 필터 */}
      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="상품명 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="고객명 검색"
          value={customerFilter}
          onChange={e => setCustomerFilter(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="판매자명 검색"
          value={sellerFilter}
          onChange={e => setSellerFilter(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          className="border rounded px-3 py-2 flex-1"
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          검색
        </button>
      </div>

      {/* 리뷰 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">상품명</th>
              <th className="px-4 py-2 border">고객명</th>
              <th className="px-4 py-2 border">판매자명</th>
              <th className="px-4 py-2 border">내용</th>
              <th className="px-4 py-2 border">평점</th>
              <th className="px-4 py-2 border">작성일</th>
              <th className="px-4 py-2 border">상태</th>
              <th className="px-4 py-2 border">신고수</th>
              <th className="px-4 py-2 border">상세</th>
            </tr>
          </thead>
          <tbody>
            {reviews?.map(review => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{review.productName}</td>
                <td className="px-4 py-2 border">{review.customerName}</td>
                <td className="px-4 py-2 border">{review.sellerName}</td>
                <td className="px-4 py-2 border max-w-xs truncate" title={review.content}>
                  {review.content}
                </td>
                <td className="px-4 py-2 border text-center">
                  {'★'.repeat(review.rating)}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border text-center">
                  {review.isHidden ? '숨김' : '공개'}
                </td>
                <td className="px-4 py-2 border text-center">
                  {review.reportCount || 0}
                </td>
                <td className="px-4 py-2 border text-center">
                  <button 
                    className="text-blue-600 underline hover:text-blue-800" 
                    onClick={() => router.push(`/admin/review-management/${review.id}`)}
                  >
                    상세
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => fetchReviews(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-3 py-1">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => fetchReviews(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      {(!reviews || reviews.length === 0) && !loading && (
        <div className="text-center text-gray-500 mt-8">
          조회된 리뷰가 없습니다.
        </div>
      )}
    </div>
  );
} 