// src/service/customer/qnaService.ts

import { customerApi } from '@/lib/apiClient';
import {
    SellerQnaResponse,
    SellerQnaDetailResponse,
    SellerQnaListResponse,
} from '@/types/seller/sellerqna/sellerQnaResponse';
import { SellerCreateQnaRequest } from '@/types/seller/sellerqna/sellerQnaRequest';
// AxiosError 임포트는 유지하여 더 나은 에러 로깅을 할 수 있도록 합니다.
import axios, { AxiosError } from 'axios';

/**
 * 특정 상품에 대한 QnA 목록 조회 (모든 사용자 접근 가능)
 * 백엔드 API 경로: GET /api/public/items/qna/{productId}
 *
 * @param productId 조회할 상품 ID
 * @param page 페이지 번호 (0-based, 기본값 0) // 백엔드 QnA API에 페이징 파라미터가 없으므로 전달하지 않습니다.
 * @param size 페이지당 항목 수 (기본값 5) // 백엔드 QnA API에 페이징 파라미터가 없으므로 전달하지 않습니다.
 * @returns QnA 목록 및 페이징 정보 (주의: 백엔드에서 CustomerQnaListDTO List를 반환하므로 SellerQnaListResponse와는 다를 수 있음)
 */
export async function getProductQnaList(
    productId: number,
    // 백엔드 API에 page, size 파라미터가 없으므로 기본값 제거 및 사용 안 함
    // page: number = 0,
    // size: number = 5
): Promise<SellerQnaListResponse> { // 이 DTO는 백엔드 응답과 정확히 일치하지 않을 수 있으니 주의
    // 변경된 URL: /api/public/items/qna/{productId}
    const url = `/public/items/qna/${productId}`;
    console.log('=== getProductQnaList API 호출 ===');
    console.log('요청 URL:', url);
    // console.log('요청 파라미터:', { productId, page, size }); // 페이징 파라미터 제거

    try {
        // 백엔드에서 List<CustomerQnaListDTO>를 반환하므로,
        // SellerQnaListResponse의 content 필드에 바로 할당될 것입니다.
        // 하지만 백엔드 DTO CustomerQnaListDTO와 SellerQnaResponse의 필드 일치 여부 확인 필요.
        const res = await customerApi.get<SellerQnaResponse[]>(url); // List 반환이므로 배열 타입으로 받습니다.

        console.log('=== getProductQnaList API 응답 상세 ===');
        console.log('HTTP 상태:', res.status);
        console.log('응답 헤더:', res.headers);
        console.log('res.data 원본:', res.data); // 응답 데이터 원본 확인
        console.log('res.data 타입:', typeof res.data);

        // 백엔드에서 List<CustomerQnaListDTO>를 직접 반환하므로,
        // SellerQnaListResponse 형식에 맞춰 가공해야 할 수 있습니다.
        // 현재 CustomerQnaListDTO와 SellerQnaResponse가 호환된다고 가정하고 진행합니다.
        // 그러나 List 형태로 오기 때문에 SellerQnaListResponse의 content 필드에 할당될 데이터를
        // 직접 SellerQnaResponse[]로 받는 것이 더 적합합니다.
        return {
            content: res.data,
            // 백엔드에서 페이징 정보를 주지 않으므로, 임의 값 또는 0으로 설정
            totalElements: res.data.length,
            size: res.data.length, // 현재 페이지에 있는 요소의 개수로 설정
            totalPages: 1, // 페이징 정보가 없으므로 단일 페이지로 간주
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

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error('응답 상태 (Axios):', axiosError.response?.status);
            console.error('응답 데이터 (Axios):', axiosError.response?.data);
            console.error('요청 설정 (Axios):', axiosError.config);
            if (axiosError.request) {
                console.error('요청 (Axios):', axiosError.request);
            }
        } else if (error instanceof Error) {
            console.error('일반 Error 객체:', error.message);
        }
        throw error;
    }
}

// --- 주의: QnA 등록 API도 확인 필요 ---
// 현재 백엔드 ProductViewController에는 QnA 등록 API가 보이지 않습니다.
// QnA 등록도 `/api/public/items/qna`와 같은 경로로 이루어져야 할 수 있습니다.
// 백엔드에서 QnA 등록 API 엔드포인트를 확인해주세요.
// 현재 createCustomerQna는 /customer/products/{productId}/qnas 로 요청합니다.

// 백엔드에 QnA 등록을 위한 별도의 CustomerQnaController가 있을 가능성이 있습니다.
// 만약 QnA 등록 API가 `/api/customer/qna` 이런 형태라면, 기존 createCustomerQna는 맞을 수 있습니다.

// 현재 제공된 ProductViewController.java에는 QnA 등록 API가 없습니다.
// `createCustomerQna` 함수의 URL도 백엔드의 실제 QnA 등록 API 경로에 맞춰 조정해야 합니다.
/*
export async function createCustomerQna(
    productId: number,
    qnaData: SellerCreateQnaRequest
): Promise<SellerQnaResponse> {
    // 이 URL도 백엔드 API에 맞춰야 합니다.
    // 예: const url = `/customer/products/${productId}/qnas`; (기존)
    // 백엔드에 따라 달라집니다. (예: /api/customer/qnas)
    const url = `/customer/products/${productId}/qnas`; // 이 부분도 확인 필요
    // ... (나머지 로직)
}
*/

// getQnaDetail 함수는 백엔드에 상세 조회 API가 있다면 해당 경로에 맞춰 수정
// 현재 ProductViewController에는 QnA 상세 조회 API가 직접 보이지 않습니다.
// 만약 `GET /api/public/qnas/{qnaId}` 형태라면 그대로 사용할 수 있지만, 확인이 필요합니다.
// 현재 getQnaDetail은 `/customer/qnas/${qnaId}` 로 요청합니다.