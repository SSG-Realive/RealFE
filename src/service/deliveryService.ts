import apiClient from '@/lib/apiClient';
import { OrderDeliveryDetail } from '@/types/sellerdelivery/sellerDelivery';

/**
 * 배송 상세 조회
 */
export async function getDeliveryDetail(orderId: number): Promise<OrderDeliveryDetail> {
    const res = await apiClient.get(`/seller/orders/${orderId}/delivery`);
    return res.data;
}

/**
 * 배송 상태 변경
 */
export async function updateDeliveryStatus(orderId: number, deliveryStatus: string): Promise<void> {
    await apiClient.patch(`/seller/orders/${orderId}/delivery`, {
        deliveryStatus
    });
}
