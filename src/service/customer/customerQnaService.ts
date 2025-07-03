// src/service/customer/qnaService.ts

import { customerApi } from '@/lib/apiClient'; // 공개 API이므로 customerApi 사용
import { AxiosError } from 'axios';
// ✨ 새로 만든 타입 임포트 (경로 확인)
import { CustomerQnaResponse, CustomerQnaListResponse } from '@/types/customer/qna/customerQnaResponse';

/**
 * 특정 상품에 대한 QnA 목록 조회 (고객용)
 * 백엔드 API 경로: GET /api/public/items/v1/qna/{productId}
 *
 * @param productId 조회할 상품 ID
 * @returns QnA 목록 및 페이징 정보 (백엔드 CustomerQnaListResponseDto 리스트를 페이징 형태로 변환)
 */
export async function getProductQnaList(
    productId: number,
): Promise<CustomerQnaListResponse> { // ⭐⭐ 반환 타입을 새로 정의한 CustomerQnaListResponse로 변경
    // ⭐⭐⭐ 변경된 URL: /api/public/items/v1/qna/{productId}
    const url = `/public/items/v1/qna/${productId}`;
    console.log('=== getProductQnaList API 호출 ===');
    console.log('요청 URL:', url);

    try {
        // 백엔드에서 List<CustomerQnaListResponseDto>를 직접 반환하므로,
        // 이를 CustomerQnaResponse[] 타입으로 받습니다.
        const res = await customerApi.get<CustomerQnaResponse[]>(url);

        console.log('=== getProductQnaList API 응답 상세 ===');
        console.log('HTTP 상태:', res.status);
        console.log('응답 데이터 원본:', res.data);

        // 백엔드에서 페이징 정보를 직접 주지 않으므로, List를 받아서 CustomerQnaListResponse 형태로 가공
        return {
            content: res.data,
            totalElements: res.data.length,
            size: res.data.length,
            totalPages: 1,
            number: 0,
            first: true,
            last: true,
            numberOfElements: res.data.length,
            empty: res.data.length === 0,
        };
    } catch (error) {
        console.error('=== getProductQnaList API 에러 ===');
        console.error('에러 상세:', error);
        console.error('요청 URL:', url);

        if (error instanceof AxiosError) {
            console.error('응답 상태 (Axios):', error.response?.status);
            console.error('응답 데이터 (Axios):', error.response?.data);
        } else if (error instanceof Error) {
            console.error('일반 Error 객체:', error.message);
        }
        throw error;
    }
}