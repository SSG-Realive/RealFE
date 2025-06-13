'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDeliveryDetail, updateDeliveryStatus } from '@/service/deliveryService';
import { OrderDeliveryDetail } from '@/types/sellerdelivery/sellerDelivery';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerLayout from '@/components/layouts/SellerLayout';

export default function DeliveryDetailPage() {
    const checking = useSellerAuthGuard();
    const params = useParams();
    const orderId = params?.id as string;

    const [delivery, setDelivery] = useState<OrderDeliveryDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [newStatus, setNewStatus] = useState<string>('');

    useEffect(() => {
        if (checking) return;
        if (!orderId) return;

        const fetchData = async () => {
            try {
                const data = await getDeliveryDetail(Number(orderId));
                setDelivery(data);
                setNewStatus(data.deliveryStatus);  // 초기 상태 설정
                setError(null);
            } catch (err) {
                console.error('배송 정보 불러오기 실패', err);
                setError('배송 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId, checking]);

    const handleStatusChange = async () => {
        try {
            await updateDeliveryStatus(Number(orderId), newStatus);
            alert('배송 상태가 변경되었습니다.');
            // 상태 변경 후 → 다시 조회
            const updatedData = await getDeliveryDetail(Number(orderId));
            setDelivery(updatedData);
        } catch (err) {
            console.error('배송 상태 변경 실패', err);
            alert('배송 상태 변경 중 오류 발생');
        }
    };

    if (checking) return <div className="p-8">인증 확인 중...</div>;
    if (loading) return <div className="p-4">로딩 중...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;
    if (!delivery) return <div className="p-4">배송 정보를 불러올 수 없습니다.</div>;

    return (
        <SellerLayout>
            <div className="max-w-xl mx-auto p-4">
                <h1 className="text-xl font-bold mb-4">배송 상세 정보</h1>

                <div className="mb-4">
                    <strong>주문 ID:</strong> {delivery.orderId}
                </div>
                <div className="mb-4">
                    <strong>구매자 ID:</strong> {delivery.buyerId}
                </div>
                <div className="mb-4">
                    <strong>상품명:</strong> {delivery.productName}
                </div>
                <div className="mb-4">
                    <strong>현재 배송 상태:</strong> {delivery.deliveryStatus}
                </div>
                <div className="mb-4">
                    <strong>배송 시작일:</strong> {delivery.startDate ?? '-'}
                </div>
                <div className="mb-4">
                    <strong>배송 완료일:</strong> {delivery.completeDate ?? '-'}
                </div>
                {/* 송장 번호 */}
<div className="mb-4">
    <label className="block font-semibold mb-1">송장 번호</label>
    {delivery.deliveryStatus === 'DELIVERY_IN_PROGRESS' ? (
        <input
            type="text"
            value={delivery.trackingNumber ?? ''}
            onChange={(e) =>
                setDelivery((prev) =>
                    prev ? { ...prev, trackingNumber: e.target.value } : prev
                )
            }
            className="w-full p-2 border"
        />
    ) : (
        <div>{delivery.trackingNumber ?? '-'}</div>
    )}
</div>

{/* 택배사 */}
<div className="mb-4">
    <label className="block font-semibold mb-1">택배사</label>
    {delivery.deliveryStatus === 'DELIVERY_IN_PROGRESS' ? (
        <input
            type="text"
            value={delivery.carrier ?? ''}
            onChange={(e) =>
                setDelivery((prev) =>
                    prev ? { ...prev, carrier: e.target.value } : prev
                )
            }
            className="w-full p-2 border"
        />
    ) : (
        <div>{delivery.carrier ?? '-'}</div>
    )}
</div>

                {/* 배송 상태 변경 */}
                <div className="mb-4">
                    <label>배송 상태 변경:</label>
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full p-2 border mt-1"
                    >
                        <option value="INIT">배송 준비전</option>   {/* ✅ 추가 */}
                        <option value="DELIVERY_PREPARING">배송 준비중</option>
                        <option value="DELIVERY_IN_PROGRESS">배송중</option>
                        <option value="DELIVERY_COMPLETED">배송 완료</option>
                    </select>
                </div>

                <button
                    onClick={handleStatusChange}
                    className="w-full bg-blue-600 text-white py-2"
                >
                    배송 상태 변경
                </button>
            </div>
        </SellerLayout>
    );
}
