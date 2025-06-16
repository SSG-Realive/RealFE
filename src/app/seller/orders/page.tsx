'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSellerOrders } from '@/service/sellerOrderService';
import { SellerOrderResponse } from '@/types/sellerorder/sellerOrder';
import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { PageResponseForOrder } from '@/types/page/pageResponseForOrder';

export default function SellerOrderListPage() {

     useSellerAuthGuard();

    const [orders, setOrders] = useState<SellerOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res: PageResponseForOrder<SellerOrderResponse> = await getSellerOrders();
                console.log('주문 목록 결과:', res);
                setOrders(res.content || []);
                setError(null);
            } catch (err) {
                console.error('주문 목록 조회 실패', err);
                setError('주문 목록을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <SellerLayout>
            <SellerHeader />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">판매자 주문 목록</h1>

                {loading ? (
                    <p className="text-gray-500">로딩 중...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : orders.length === 0 ? (
                    <p className="text-gray-400">등록된 주문이 없습니다.</p>
                ) : (
                    <ul className="space-y-4">
                        {orders.map((order) => (
                            <li
                                key={order.orderId}
                                className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => router.push(`/seller/orders/${order.orderId}`)}
                            >
                                <p>주문 ID: {order.orderId}</p>
                                <p>주문일자: {new Date(order.orderedAt).toLocaleString()}</p>
                                <p>고객명: {order.customerName}</p>
                                <p>상품명: {order.productName}</p>
                                <p>수량: {order.quantity}</p>
                                <p>상태: {order.deliveryStatus}</p>
                                {/* totalPrice는 현재 API에 없음 → 나중에 추가 시 사용 */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </SellerLayout>
    );
}
