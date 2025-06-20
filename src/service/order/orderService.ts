// src/services/orderService.ts (수정된 버전)

import { customerApi } from '@/lib/apiClient'; // ✨ apiClient의 기본 export 대신 customerApi를 명시적으로 import
import { Page, Order } from '@/types/customer/order/order';

/**
 * 특정 고객의 주문 목록을 조회하는 API 함수
 * React Query의 queryFn으로 사용됩니다.
 * @param page 조회할 페이지 번호 (0부터 시작)
 * @param size 페이지 당 아이템 수
 * @returns Promise<Page<Order>>
 */
export const getOrderList = async (page: number, size: number = 10): Promise<Page<Order>> => {
    // ✨ apiClient 대신 customerApi를 사용
    const { data } = await customerApi.get<Page<Order>>('/customer/orders', {
        params: {
            page,
            size,
            sort: 'orderedAt,desc',
        },
    });
    return data;
};