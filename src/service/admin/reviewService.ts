import { adminApi } from "@/lib/apiClient";
import {
  AdminReview,
  AdminReviewListRequest,
  AdminReviewListResponse,
  AdminReviewReport,
  AdminReviewReportListRequest,
  AdminReviewReportListResponse,
  AdminReviewReportProcessRequest,
  AdminReviewQna,
  AdminReviewQnaListRequest,
  AdminReviewQnaListResponse,
  AdminReviewQnaAnswerRequest,
} from "@/types/admin/review";

// 리뷰 목록 조회
export const getAdminReviewList = async (params: AdminReviewListRequest): Promise<AdminReviewListResponse> => {
  const { sortBy, sortOrder, ...rest } = params;
  const queryParams = {
    ...rest,
    sort: sortBy && sortOrder ? `${sortBy},${sortOrder}` : 'createdAt,desc'
  };
  const response = await adminApi.get('/admin/seller-reviews', { params: queryParams });
  return response.data;
};

// 리뷰 상세 조회
export const getAdminReview = async (reviewId: number): Promise<AdminReview> => {
  const response = await adminApi.get(`/admin/seller-reviews/${reviewId}`);
  return response.data;
};

// 리뷰 상태 변경
export const updateAdminReview = async (reviewId: number, isHidden: boolean): Promise<void> => {
  await adminApi.patch(`/admin/seller-reviews/${reviewId}`, { isHidden });
};

// 리뷰 신고 목록 조회
export const getAdminReviewReportList = async (params: AdminReviewReportListRequest): Promise<AdminReviewReportListResponse> => {
  // 정렬 파라미터는 백엔드에서 지원하지 않으므로 제거
  const response = await adminApi.get('/admin/reviews-reports/reports', { params });
  return response.data;
};

// 리뷰 신고 상세 조회
export const getAdminReviewReport = async (reportId: number): Promise<AdminReviewReport> => {
  const response = await adminApi.get(`/admin/reviews-reports/reports/${reportId}`);
  return response.data;
};

// 리뷰 신고 처리
export const processAdminReviewReport = async (reportId: number, request: AdminReviewReportProcessRequest): Promise<void> => {
  await adminApi.patch(`/admin/reviews-reports/reports/${reportId}`, request);
};

// 리뷰 Q&A 목록 조회
export const getAdminReviewQnaList = async (params: AdminReviewQnaListRequest): Promise<AdminReviewQnaListResponse> => {
  const response = await adminApi.get('/admin/seller-reviews/qna', { params });
  return response.data;
};

// 리뷰 Q&A 상세 조회
export const getAdminReviewQna = async (qnaId: number): Promise<AdminReviewQna> => {
  const response = await adminApi.get(`/admin/seller-reviews/qna/${qnaId}`);
  return response.data;
};

// 리뷰 Q&A 답변 등록
export const answerAdminReviewQna = async (qnaId: number, request: AdminReviewQnaAnswerRequest): Promise<void> => {
  await adminApi.post(`/admin/seller-reviews/qna/${qnaId}/answer`, request);
};

// 리뷰 Q&A 상태 변경
export const updateAdminReviewQnaStatus = async (qnaId: number, isHidden: boolean): Promise<void> => {
  await adminApi.patch(`/admin/seller-reviews/qna/${qnaId}`, { isHidden });
}; 