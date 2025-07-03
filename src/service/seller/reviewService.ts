import apiClient from '@/lib/apiClient';
import { SellerReviewListResponse, SellerReviewStatistics, ReviewFilterOptions } from '@/types/seller/review';

// 판매자의 리뷰 목록 조회
export const getSellerReviews = async (
  page: number = 0,
  size: number = 10,
  filters?: ReviewFilterOptions
): Promise<SellerReviewListResponse> => {
  const params: any = { page, size };
  
  if (filters?.productName) {
    params.productName = filters.productName;
  }
  if (filters?.rating) {
    params.rating = filters.rating;
  }
  if (filters?.sortBy) {
    params.sortBy = filters.sortBy;
  }

  const response = await apiClient.get('/api/seller/reviews', { params });
  return response.data;
};

// 판매자의 리뷰 통계 조회
export const getSellerReviewStatistics = async (): Promise<SellerReviewStatistics> => {
  const response = await apiClient.get('/api/seller/reviews/statistics');
  return response.data;
}; 