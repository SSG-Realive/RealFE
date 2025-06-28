import { sellerApi } from '@/lib/apiClient';
import { PageResponse } from '@/types/seller/page/pageResponse';
import { PageResponseForOrder } from '@/types/seller/page/pageResponseForOrder';
import {
    SellerOrderResponse,
    SellerOrderDetailResponse,
    DeliveryStatusUpdateRequest,
} from '@/types/seller/sellerorder/sellerOrder';

/**
 * 판매자 주문 목록 조회 (PageResponse 기반)
 * @param searchParams - 페이지, 정렬, 검색 필터 등
 */
export async function getSellerOrders(): Promise<PageResponseForOrder<SellerOrderResponse>> {
    const res = await sellerApi.get('/seller/orders');
    return res.data;
}

/**
 * 주문 상세 조회 (새로운 API 사용)
 */
export async function getOrderDetail(orderId: number): Promise<SellerOrderDetailResponse> {
    const res = await sellerApi.get(`/seller/orders/${orderId}`);
    return res.data;
}

/**
 * 배송 상태 변경 (판매자 → 관리자/고객에게)
 * @param orderId - 주문 ID
 * @param updateData - 배송 상태 + 옵션: 운송장 번호, 택배사
 */
export async function updateDeliveryStatus(
    orderId: number,
    updateData: DeliveryStatusUpdateRequest
): Promise<void> {
    await sellerApi.patch(`/seller/orders/${orderId}/delivery`, updateData);
}

/**
 * 배송 취소
 * @param orderId - 주문 ID
 */
export async function cancelOrderDelivery(orderId: number): Promise<void> {
    await sellerApi.patch(`/seller/orders/${orderId}/cancel`);
}