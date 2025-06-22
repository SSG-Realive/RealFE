// 관리자용 리뷰 관련 타입들

export type ReviewReportStatus = 
  | 'PENDING'           // 접수됨 (처리 대기)
  | 'UNDER_REVIEW'      // 검토 중
  | 'RESOLVED_KEPT'     // 처리 완료 - 리뷰 유지
  | 'RESOLVED_HIDDEN'   // 처리 완료 - 리뷰 숨김/삭제
  | 'RESOLVED_REJECTED' // 처리 완료 - 신고 기각
  | 'REPORTER_ACCOUNT_INACTIVE' // 신고자 계정 비활성화
  | ''; // 전체 상태를 위한 빈 문자열

export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  customerId: number;
  customerName: string;
  customerImage?: string;
  sellerId: number;
  sellerName: string;
  content: string;
  rating: number;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  reportCount?: number;
}

export interface AdminReviewReport {
  reportId: number;
  reporterId: number;
  reporterName: string;
  reviewId: number;
  reason: string;
  reportedAt: string;
  status: ReviewReportStatus;
  
  // review: AdminReportedReview | null; // 삭제
  // 아래는 AdminReportedReview의 필드들입니다.
  customerId: number;
  customerName: string;
  customerImage: string | null;
  productName: string;
  content: string;
  rating: number;
}

export interface AdminReviewQna {
  id: number;
  productId: number;
  productName: string;
  customerId: number;
  userName: string;
  title: string;
  content?: string;
  answer?: string;
  isAnswered: boolean;
  status: string; // PENDING, ANSWERED, HIDDEN
  createdAt: string;
  updatedAt?: string;
  answeredAt?: string;
}

export interface AdminReviewQnaDetail {
  id: number;
  productId: number;
  productName: string;
  customerId: number;
  userName: string;
  title: string;
  content: string;
  answer?: string;
  isAnswered: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
}

export interface AdminReviewListRequest {
  page?: number;
  size?: number;
  sort?: string;
  productFilter?: string;
  customerFilter?: string;
  sellerFilter?: string;
}

export interface AdminReviewListResponse {
  content: AdminReview[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface AdminReviewReportListRequest {
  page?: number;
  size?: number;
  status?: ReviewReportStatus;
  sort?: string;
}

export interface AdminReviewReportListResponse {
  content: AdminReviewReport[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface AdminReviewQnaListRequest {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  isAnswered?: boolean;
}

export interface AdminReviewQnaListResponse {
  content: AdminReviewQna[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface AdminReviewUpdateRequest {
  status: 'NORMAL' | 'HIDDEN' | 'DELETED';
}

export interface AdminReviewReportProcessRequest {
  newStatus: ReviewReportStatus;
  adminComment?: string;
}

export interface AdminReviewQnaAnswerRequest {
  answer: string;
}

export interface AdminReportedReview {
  // ... existing code ...
} 