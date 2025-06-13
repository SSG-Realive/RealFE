import apiClient from '@/lib/apiClient';
import { PageResponse } from '@/types/page/pageResponse';
import {
    SellerOrderResponse,
    SellerOrderDetailResponse,
    DeliveryStatusUpdateRequest,
} from '@/types/sellerOrder';

/**
 * 판매자 주문 목록 조회 (검색 조건 + 페이지네이션)
 * @param searchParams - 필터 조건 및 페이징 정보
 */
export async function getSellerOrders(
    searchParams: Record<string, any> = {}
): Promise<PageResponse<SellerOrderResponse>> {
    const cleanedParams: Record<string, string> = {};

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value != null && value !== '') {
            cleanedParams[key] = value instanceof Date ? value.toISOString() : String(value);
        }
    });

    // ✅ 정렬 기본값 지정 (백엔드 필드명에 맞게)
    if (!cleanedParams['sort']) {
        cleanedParams['sort'] = 'orderedAt,desc';
    }

    const query = new URLSearchParams(cleanedParams).toString();
    const url = query ? `/seller/orders?${query}` : '/seller/orders';

    // ✅ 디버깅 로그
    console.log('[📦 주문 목록 요청]', url);

    const res = await apiClient.get(url);
    const data = res.data;

    // ✅ content → dtoList 로 변환
    return {
        dtoList: data.content,
        total: data.totalElements,
        page: data.number,
        size: data.size,
        start: data.number * data.size + 1,
        end: data.number * data.size + data.content.length,
        prev: !data.first,
        next: !data.last,
    };
}

/**
 * 주문 상세 조회
 */
export async function getOrderDetail(orderId: number): Promise<SellerOrderDetailResponse> {
    const res = await apiClient.get(`/seller/orders/${orderId}`);
    return res.data;
}

/**
 * 배송 상태 변경 (판매자 → 고객/관리자)
 */
export async function updateDeliveryStatus(
    orderId: number,
    updateData: DeliveryStatusUpdateRequest
): Promise<void> {
    await apiClient.patch(`/seller/orders/${orderId}/delivery`, updateData);
}
