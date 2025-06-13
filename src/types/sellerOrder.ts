// 🔹 배송 상태 enum 정의
export type DeliveryStatus =
    | 'DELIVERY_PREPARING'
    | 'DELIVERY_IN_PROGRESS'
    | 'DELIVERY_COMPLETED';

// 🔹 주문 목록 응답 DTO (요약용)
export interface SellerOrderResponse {
    orderId: number;
    customerName: string;
    productName: string;
    quantity: number;
    orderedAt: string;

    deliveryStatus: DeliveryStatus;
    deleiveryStatusText?: string;

    trackingNumber?: string;
    startDate?: string;
    completeDate?: string;

    deliveryType?: string;
}

// 🔹 주문 상세 응답 DTO
export interface SellerOrderDetailResponse extends SellerOrderResponse {
    deliveryAddress: string;
    receiverName: string;
    phone: string;
    deliveryFee: number;

    items: {
        productId: number;
        productName: string;
        quantity: number;
        price: number;
    }[];

    paymentType?: string;
}

// 🔹 배송 상태 변경 요청 DTO
export interface DeliveryStatusUpdateRequest {
    deliveryStatus: DeliveryStatus;
    trackingNumber?: string;
    carrier?: string;
}
