'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderDetail } from '@/service/sellerOrderService';
import { SellerOrderDetailResponse } from '@/types/sellerOrder';
import Header from '@/components/Header';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';

export default function SellerOrderDetailPage() {
    useSellerAuthGuard();
    const router = useRouter();
    const params = useParams();

    const [order, setOrder] = useState<SellerOrderDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const orderId = Number(params.id);

    useEffect(() => {
        if (isNaN(orderId)) {
            setError('잘못된 주문 ID입니다.');
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const data = await getOrderDetail(orderId);
                setOrder(data);
                setError(null);
            } catch (err) {
                console.error('주문 상세 조회 실패', err);
                setError('주문 상세 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    return (
        <SellerLayout>
            <Header />
            <div className="p-6 max-w-4xl mx-auto">
                <button
                    className="mb-4 text-blue-600 hover:underline"
                    onClick={() => router.back()}
                >
                    ← 뒤로가기
                </button>

                <h1 className="text-2xl font-bold mb-4">주문 상세</h1>

                {loading ? (
                    <p className="text-gray-500">로딩 중...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : order ? (
                    <div className="space-y-3">
                        <p><strong>주문 ID:</strong> {order.orderId}</p>
                        <p><strong>주문일:</strong> {new Date(order.orderedAt).toLocaleString()}</p>
                        <p><strong>배송 상태:</strong> {order.deliveryStatus}</p>
                        <p><strong>받는 사람:</strong> {order.receiverName}</p>
                        <p><strong>연락처:</strong> {order.phone}</p>
                        <p><strong>주소:</strong> {order.deliveryAddress}</p>
                        <p><strong>배송비:</strong> {order.deliveryFee.toLocaleString()}원</p>
                        <p><strong>결제 수단:</strong> {order.paymentType ?? '미지정'}</p>

                        <h2 className="text-xl font-semibold mt-6">주문 상품</h2>
                        <ul className="mt-2 space-y-2">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="p-3 border rounded">
                                    <p>상품명: {item.productName}</p>
                                    <p>수량: {item.quantity}</p>
                                    <p>가격: {item.price.toLocaleString()}원</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400">주문 정보를 찾을 수 없습니다.</p>
                )}
            </div>
        </SellerLayout>
    );
}