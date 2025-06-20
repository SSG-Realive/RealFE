// src/types/order.ts

// OrderResponseDTO의 orderItems 배열에 들어갈 객체의 타입
export interface OrderItem {
    orderItemId: number; // DTO에 맞게 타입 설정
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string; // Optional
}

// OrderResponseDTO에 해당하는 메인 타입
export interface Order {
    orderId: number;
    customerId: number;
    deliveryAddress: string;
    totalPrice: number;
    orderStatus: string;
    orderCreatedAt: string; // ISO 8601 형식의 날짜 문자열
    updatedAt: string;
    orderItems: OrderItem[];
    deliveryFee: number;
    receiverName: string;
    phone: string;
    paymentType: string;
    deliveryStatus: string;
}

// Spring의 Page<T> 응답 객체에 대한 제네릭 타입
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // 현재 페이지 번호 (0부터 시작)
    first: boolean;
    last: boolean;
    empty: boolean;
}