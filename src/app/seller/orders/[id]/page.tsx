'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderDetail, updateDeliveryStatus, cancelOrderDelivery } from '@/service/seller/sellerOrderService';
import { SellerOrderDetailResponse, DeliveryStatus } from '@/types/seller/sellerorder/sellerOrder';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerLayout from '@/components/layouts/SellerLayout';
import Image from 'next/image';

export default function OrderDetailPage() {
    const checking = useSellerAuthGuard();
    const params = useParams();
    const orderId = params?.id as string;

    const [order, setOrder] = useState<SellerOrderDetailResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [newStatus, setNewStatus] = useState<string>('');
    const [trackingNumber, setTrackingNumber] = useState<string>('');
    const [carrier, setCarrier] = useState<string>('');

    const getNextStatusOptionsFor = (currentStatus: string): string[] => {
        switch (currentStatus) {
            case 'INIT':
                return ['DELIVERY_PREPARING'];
            case 'DELIVERY_PREPARING':
                return ['DELIVERY_IN_PROGRESS'];
            case 'DELIVERY_IN_PROGRESS':
                return ['DELIVERY_COMPLETED'];
            default:
                return [];
        }
    };

    useEffect(() => {
        if (checking || !orderId) return;

        const fetchData = async () => {
            try {
                const data = await getOrderDetail(Number(orderId));
                setOrder(data);
                const nextOptions = getNextStatusOptionsFor(data.deliveryStatus);
                setNewStatus(nextOptions.length > 0 ? nextOptions[0] : data.deliveryStatus);
                setTrackingNumber(data.trackingNumber ?? '');
                setCarrier(data.carrier ?? '');
                setError(null);
            } catch (err) {
                console.error('주문 정보 불러오기 실패', err);
                setError('주문 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId, checking]);

    const handleStatusChange = async () => {
        if (!order) return;

        const isStatusChanged = order.deliveryStatus !== newStatus;
        const isTrackingChanged = order.trackingNumber !== trackingNumber;
        const isCarrierChanged = order.carrier !== carrier;

        if (!isStatusChanged && !isTrackingChanged && !isCarrierChanged) {
            alert('변경사항이 없습니다.');
            return;
        }

        try {
            await updateDeliveryStatus(Number(orderId), {
                deliveryStatus: newStatus as DeliveryStatus,
                trackingNumber: isTrackingChanged ? trackingNumber : undefined,
                carrier: isCarrierChanged ? carrier : undefined,
            });

            alert('배송 상태가 변경되었습니다.');
            const updatedData = await getOrderDetail(Number(orderId));
            setOrder(updatedData);
            setNewStatus(updatedData.deliveryStatus);
            setTrackingNumber(updatedData.trackingNumber ?? '');
            setCarrier(updatedData.carrier ?? '');
        } catch (err) {
            console.error('배송 상태 변경 실패', err);
            alert('배송 상태 변경 중 오류 발생');
        }
    };

    const handleCancel = async () => {
        const confirmCancel = confirm('배송을 정말 취소하시겠습니까?');
        if (!confirmCancel) return;

        try {
            await cancelOrderDelivery(Number(orderId));
            alert('배송이 취소되었습니다.');
            location.reload();
        } catch (err) {
            console.error('배송 취소 실패', err);
            alert('배송 취소 중 오류 발생');
        }
    };

    if (checking) return <div className="p-4 sm:p-8">인증 확인 중...</div>;
    if (loading) return <div className="p-4">로딩 중...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;
    if (!order) return <div className="p-4">주문 정보를 불러올 수 없습니다.</div>;

    const nextStatusOptions = getNextStatusOptionsFor(order.deliveryStatus);
    const isFinalState =
        order.deliveryStatus === 'DELIVERY_COMPLETED' || order.deliveryStatus === 'CANCELLED';

    return (
        <div className="flex flex-col min-h-screen w-full">
            <main className="flex-1">
                <SellerLayout>
                    <div className="max-w-4xl mx-auto p-4 sm:p-6">
                        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">주문 상세 정보</h1>

                        {/* 주문 기본 정보 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">주문 정보</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">주문 ID:</span>
                                        <span className="text-gray-900 font-mono">#{order.orderId}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">주문일시:</span>
                                        <span className="text-gray-900">{new Date(order.orderedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">결제수단:</span>
                                        <span className="text-gray-900">{order.paymentType}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">총 결제금액:</span>
                                        <span className="text-gray-900 font-semibold">{order.totalPrice.toLocaleString()}원</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">배송비:</span>
                                        <span className="text-gray-900">{order.deliveryFee.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">배송 상태:</span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            order.deliveryStatus === 'DELIVERY_COMPLETED' 
                                                ? 'bg-green-100 text-green-800'
                                                : order.deliveryStatus === 'CANCELLED'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 고객 정보 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">고객 정보</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">고객명:</span>
                                        <span className="text-gray-900">{order.customerName}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">연락처:</span>
                                        <span className="text-gray-900">{order.customerPhone}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">수령인:</span>
                                        <span className="text-gray-900">{order.receiverName}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">배송지:</span>
                                        <span className="text-gray-900 break-words">{order.deliveryAddress}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 주문 상품 목록 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">주문 상품</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                        {item.imageUrl && (
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-md object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h3>
                                            <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
                                            <p className="text-sm text-gray-500">단가: {item.price.toLocaleString()}원</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {(item.price * item.quantity).toLocaleString()}원
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 배송 정보 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">배송 정보</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">배송 시작일:</span>
                                        <span className="text-gray-900">{order.startDate ? new Date(order.startDate).toLocaleString() : '-'}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">배송 완료일:</span>
                                        <span className="text-gray-900">{order.completeDate ? new Date(order.completeDate).toLocaleString() : '-'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">송장번호:</span>
                                        <span className="text-gray-900">{order.trackingNumber || '-'}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">택배사:</span>
                                        <span className="text-gray-900">{order.carrier || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 배송 상태 변경 */}
                        {nextStatusOptions.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">배송 상태 변경</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            새로운 배송 상태
                                        </label>
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {nextStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {(order.deliveryStatus === 'DELIVERY_IN_PROGRESS' || newStatus === 'DELIVERY_IN_PROGRESS') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    송장 번호
                                                </label>
                                                <input
                                                    type="text"
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="송장 번호를 입력하세요"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    택배사
                                                </label>
                                                <input
                                                    type="text"
                                                    value={carrier}
                                                    onChange={(e) => setCarrier(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="택배사명을 입력하세요"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleStatusChange}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            상태 변경
                                        </button>
                                        {!isFinalState && (
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                배송 취소
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isFinalState && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <p className="text-gray-600">
                                    {order.deliveryStatus === 'DELIVERY_COMPLETED' 
                                        ? '배송이 완료되었습니다.' 
                                        : '배송이 취소되었습니다.'}
                                </p>
                            </div>
                        )}
                    </div>
                </SellerLayout>
            </main>
        </div>
    );
} 