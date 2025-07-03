'use client';

import { useEffect, useState, useRef } from 'react';
import { OrderResponseDTO } from '@/types/orders/orderResponseDTO';
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/store/customer/authStore';

async function fetchOrderDetail(orderId: number, token: string): Promise<OrderResponseDTO> {
    const url = `http://localhost:8080/api/customer/orders/${orderId}`;
    const response = await fetch(url, {
        cache: "no-store",
        redirect: 'follow',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`주문 상세 정보를 불러오는 데 실패했습니다: ${response.statusText || errorData}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error("API 응답이 JSON 형식이 아닙니다.");
    }

    return response.json();
}

interface OrderDetailClientProps {
    orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
    const [orderData, setOrderData] = useState<OrderResponseDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const { accessToken, hydrated } = useAuthStore();

    useEffect(() => {
        if (!hydrated) return;
        if (!accessToken) {
            setError("로그인 토큰이 없습니다. 다시 로그인 해주세요.");
            setLoading(false);
            return;
        }

        const numericOrderId = Number(orderId);
        if (isNaN(numericOrderId) || numericOrderId <= 0) {
            setError("유효하지 않은 주문 ID입니다.");
            setLoading(false);
            return;
        }

        const getOrder = async () => {
            try {
                const data = await fetchOrderDetail(numericOrderId, accessToken);
                setOrderData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
            } finally {
                setLoading(false);
            }
        };

        getOrder();
    }, [orderId, accessToken, hydrated]);

    const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft += e.deltaY;
        }
    };

    if (loading || !hydrated) return <div><div className="p-4 text-center">로딩 중...</div></div>;
    if (error) return <div><div className="p-4 text-center text-red-600">{error}</div></div>;
    if (!orderData) return <div><div className="p-4 text-center">주문 정보를 찾을 수 없습니다.</div></div>;

    return (
        <div>
            <div className="container mx-auto px-4 pb-10 font-inter">
                {/* 주문 상세 정보 */}
                <div className="bg-gray-100 shadow-xl rounded-lg p-6 border border-gray-200 max-w-2xl mx-auto w-full mt-6">
                    <h1 className="text-2xl font-light mb-6 text-center text-gray-900">주문 상세 정보</h1>
                    <p className="mb-1">주문 번호: <span className="font-semibold">{orderData.orderId}</span></p>
                    <p className="mb-1">고객 ID: {orderData.customerId}</p>
                    <p className="mb-1">배송 주소: {orderData.deliveryAddress}</p>
                    <p className="mb-1">총 주문 가격: <span className="font-semibold">{orderData.totalPrice.toLocaleString()}원</span></p>
                    <p className="mb-1">주문 일시: {new Date(orderData.orderCreatedAt).toLocaleString()}</p>
                    <p className="mb-1">최종 업데이트: {new Date(orderData.updatedAt).toLocaleString()}</p>
                    <p className="mb-1">결제 방식: {orderData.paymentType}</p>
                    <p className="mb-1">배송비: {orderData.deliveryFee.toLocaleString()}원</p>
                    <p className="mb-1">수령인: {orderData.receiverName}</p>
                    <p className="mb-3">연락처: {orderData.phone}</p>
                    <p>
                        주문 상태:{" "}
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${orderData.orderStatus === "ORDER" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {orderData.orderStatus === "ORDER" ? "주문 완료" : "주문 취소"}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">({orderData.deliveryStatus})</span>
                    </p>
                </div>

                {/* 주문 상품 목록 */}
                <h2 className="text-2xl font-light mt-10 mb-4 text-gray-800">주문 상품 목록</h2>

                {/* 💡 가로스크롤 영역은 전체 너비로 분리 */}
                <div
                    className="w-full overflow-x-auto no-scrollbar px-4"
                    onWheel={handleWheelScroll}
                    ref={scrollRef}
                >
                    <div className="flex gap-4 w-max pb-2">
                        {orderData.orderItems.map((item) => (
                            <div
                                key={item.productId}
                                className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 w-64 flex-shrink-0 flex flex-col justify-between h-[360px]"
                            >
                                <img
                                    src={item.imageUrl?.trim() || '/images/placeholder.png'}
                                    alt={item.productName || "상품 이미지"}
                                    className="w-full h-40 object-cover rounded-md mb-3"
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/placeholder.png';
                                        e.currentTarget.onerror = null;
                                    }}
                                />
                                <div className="flex flex-col justify-between flex-grow">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[3.5rem]">
                                            {item.productName}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-1">{item.quantity}개</p>
                                        <p className="text-base font-bold text-black mb-2">
                                            {item.price.toLocaleString()}원
                                        </p>
                                    </div>
                                    <button
                                        className="mt-auto w-full py-2 bg-white text-gray-700 border border-gray-300 rounded-none hover:bg-gray-100 transition"
                                        onClick={() =>
                                            router.push(`/customer/reviews/new?orderId=${orderData.orderId}&sellerId=${item.sellerId}`)
                                        }
                                    >
                                        리뷰 작성
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                    <button
                        onClick={() => router.push('/main')}
                        className="px-6 py-3 bg-black text-white rounded-none hover:bg-gray-900 transition font-semibold"
                    >
                        쇼핑 계속하기
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-black text-white rounded-none hover:bg-gray-900 transition font-semibold"
                    >
                        이전 페이지로
                    </button>
                </div>
            </div>
        </div>
    );
}
