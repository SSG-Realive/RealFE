import { sellerApi } from '@/lib/apiClient';
import { useSellerAuthStore } from '@/store/seller/useSellerAuthStore';
import { SellerDashboardResponse, SellerSalesStatsDTO, DailySalesDTO, MonthlySalesDTO } from '@/types/seller/dashboard/sellerDashboardResponse';
import { LoginResponse } from '@/types/seller/login/loginResponse';
import {publicSellerInfoResponseDTO} from "@/types/seller/publicSellerInfoResponseDTO";
import {ReviewResponseDTO} from "@/types/reviews/reviewResponseDTO";
import {ReviewListResponseDTO} from "@/types/reviews/reviewListResponseDTO";
import {ProductListDTO} from "@/types/seller/product/product";



// 로그인 요청
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await sellerApi.post('/seller/login', { email, password });
  return response.data;
}


//로그아웃 요청
export async function logout(): Promise<void> {
  await sellerApi.post('/seller/logout'); // 서버 쿠키 제거
  useSellerAuthStore.getState().logout(); // 상태도 초기화
}

// 프로필 조회
export interface SellerProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
}
export async function getProfile(): Promise<SellerProfile> {
  const response = await sellerApi.get<SellerProfile>('/seller/me');
  return response.data;
}

// 프로필 수정
export interface SellerUpdateRequest {
  name: string;
  phone: string;
  newPassword?: string;
}
// 백엔드가 PUT 으로 받으니 여기서도 PUT으로 바꿔야 합니다.
export async function updateProfile(data: SellerUpdateRequest): Promise<void> {
  await sellerApi.put('/seller/me', data);
}
//대시보드

export async function getDashboard() : Promise<SellerDashboardResponse> {
  const response = await sellerApi.get('/seller/dashboard');
  return response.data;
}

// 새로운 판매 통계 API 함수들
export async function getSalesStatistics(startDate: string, endDate: string): Promise<SellerSalesStatsDTO> {
  const response = await sellerApi.get(`/seller/dashboard/sales-stats?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
}

export async function getDailySalesTrend(startDate: string, endDate: string): Promise<DailySalesDTO[]> {
  const response = await sellerApi.get(`/seller/dashboard/daily-sales-trend?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
}

export async function getMonthlySalesTrend(startDate: string, endDate: string): Promise<MonthlySalesDTO[]> {
  const response = await sellerApi.get(`/seller/dashboard/monthly-sales-trend?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
}

// 고객(비회원포함)의 판매자 전체 목록 또는 기간별 조회 (기존 함수 유지)
export async function getSellerPublicInfoList(startDate: string, endDate: string): Promise<publicSellerInfoResponseDTO[]> {
  const response = await sellerApi.get(`/public/seller`, {
    params: { startDate, endDate } // 쿼리 파라미터로 전달
  });
  return response.data; // 목록 형태일 수 있습니다. DTO가 단일 객체라면 조정 필요
}

// 특정 판매자의 공개 프로필 정보 조회 (새로 추가)
export async function getSellerPublicInfo(sellerId: number): Promise<publicSellerInfoResponseDTO | null> {
  try {
    const response = await sellerApi.get(`/public/seller/by-product/${sellerId}`);
    return response.data;
  } catch (error: any) {
    // 404 에러 등 특정 HTTP 상태 코드 처리
    if (error.response && error.response.status === 404) {
      console.warn(`판매자 ID ${sellerId}의 공개 정보를 찾을 수 없습니다.`);
      return null;
    }
    console.error(`판매자 공개 정보 가져오기 오류 (ID: ${sellerId}):`, error);
    throw error; // 다른 오류는 다시 던져서 상위 컴포넌트에서 처리
  }
}

// 특정 판매자의 리뷰 조회 (수정된 함수)
export async function getSellerReviews(
    sellerId: number,
    page: number = 0,
    size: number = 5,
    sort: string = "createdAt",
    direction: string = "DESC"
): Promise<{ reviews: ReviewResponseDTO[]; hasMore: boolean }> {
  try {
    const requestParams = { page: page + 1, size, sort, direction };
    console.log(`[getSellerReviews] Preparing API call for reviews. URL: /public/seller/${sellerId}/reviews, Params:`, requestParams);

    const response = await sellerApi.get(`/public/seller/${sellerId}/reviews`, {
      params: requestParams
    });

    console.log(`[getSellerReviews] API call successful for reviews. Response status: ${response.status}`);
    const rawData = response.data;
    console.log(`[getSellerReviews] Raw API Response data:`, rawData); // 이 로그는 여전히 유용합니다.

    let reviewsToReturn: ReviewResponseDTO[] = [];
    let hasMoreToReturn: boolean = false;

    // ⭐⭐ 여기를 수정합니다! ⭐⭐
    // 백엔드 응답은 'dtoList' 필드에 실제 리뷰 배열을 포함하고 있습니다.
    // 'total' 필드가 전체 개수를 나타냅니다.
    if (rawData && Array.isArray(rawData.dtoList) && typeof rawData.total === 'number') {
      reviewsToReturn = rawData.dtoList; // 이제 'reviews' 대신 'dtoList' 사용
      // `hasMore` 계산 로직도 `total` 필드를 사용하여 수정
      // `rawData.page`는 1-based 페이지 번호이므로, 그대로 사용
      hasMoreToReturn = (rawData.page * rawData.size) < rawData.total;
    } else {
      // 예상치 못한 응답 구조일 경우 경고 로깅
      console.warn("[getSellerReviews] Unexpected API response structure for reviews. Returning empty array.");
      console.warn("[getSellerReviews] Raw data that caused the issue:", rawData);
    }

    console.log(`[getSellerReviews] Extracted Reviews:`, reviewsToReturn);
    console.log(`[getSellerReviews] Calculated HasMore:`, hasMoreToReturn);

    return { reviews: reviewsToReturn, hasMore: hasMoreToReturn };

  } catch (error: any) {
    console.error(`[getSellerReviews] Error fetching seller reviews (ID: ${sellerId}, 페이지: ${page}):`, error);
    if (error.response) {
      console.error(`[getSellerReviews] Error Response Status: ${error.response.status}`);
      console.error(`[getSellerReviews] Error Response Data:`, error.response.data);
    } else if (error.request) {
      console.error(`[getSellerReviews] No response received:`, error.request);
    } else {
      console.error(`[getSellerReviews] Error setting up request:`, error.message);
    }
    return { reviews: [], hasMore: false };
  }
}

// 특정 판매자의 상품 조회 (추가 또는 기존 함수 수정)
export async function getSellerProducts(
    sellerId: number,
    page: number = 0,
    size: number = 10,
    orderBy: string = "createdAt",
    order: string = "desc"
): Promise<{ products: ProductListDTO[]; hasMore: boolean }> {
  try {
    // 백엔드 PageRequestDTO의 page는 1-based이므로 page + 1을 보냅니다.
    const response = await sellerApi.get(`/public/seller/${sellerId}/products`, {
      params: { page: page + 1, size, orderBy, order }
    });
    const data: { dtoList: ProductListDTO[]; total: number; pageCount: number; } = response.data;
    const hasMore = ((page + 1) * size) < data.total;
    return { products: data.dtoList, hasMore };
  } catch (error) {
    console.error(`판매자 상품 가져오기 오류 (ID: ${sellerId}, 페이지: ${page}):`, error);
    return { products: [], hasMore: false };
  }
}

//qna

