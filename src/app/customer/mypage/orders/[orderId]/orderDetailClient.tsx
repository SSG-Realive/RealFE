// src/app/customer/orders/[orderId]/OrderDetailClient.tsx
// 이 파일은 클라이언트 컴포넌트입니다.
'use client';

import { useEffect, useState } from 'react';
// Image 컴포넌트를 사용하지 않으므로 import를 제거할 수 있습니다.
// import Image from 'next/image'; // 주석 처리 또는 제거
import { OrderResponseDTO } from '@/types/orders/orderResponseDTO'; // DTO 타입 임포트
import Navbar from '@/components/customer/common/Navbar';
import { OrderItemResponseDTO } from '@/types/orders/orderItemResponseDTO';
import { useRouter } from "next/navigation"; // DTO 타입 임포트
import { useAuthStore } from '@/store/customer/authStore';


// --- 데이터 페칭 함수 (클라이언트에서 실행) ---
async function fetchOrderDetail(orderId: number, token: string): Promise<OrderResponseDTO> {
    const url = `http://localhost:8080/api/customer/orders/${orderId}`;
    console.log("클라이언트에서 주문 상세 정보를 가져오는 중:", url);
    console.log("Authorization 헤더에 포함될 토큰 (앞 10자):", token ? `Bearer ${token.substring(0, 10)}...` : "토큰 없음");

    const response = await fetch(url, {
        cache: "no-store", // 캐시 사용 안 함
        redirect: 'follow', // 리다이렉트 따름
        headers: {
            'Authorization': token ? `Bearer ${token}` : '', // localStorage에서 가져온 토큰 사용
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`주문 상세 API 오류: ${response.status} - ${errorData}`);
        throw new Error(`주문 상세 정보를 불러오는 데 실패했습니다: ${response.statusText || '알 수 없는 오류'}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("API 응답이 JSON 형식이 아닙니다 (예상치 못한 응답):", textResponse);
        throw new Error("API 응답이 JSON 형식이 아닙니다.");
    }

    return response.json(); // JSON 데이터 파싱 및 반환
}

// ⭐ 수정된 props 인터페이스: orderId를 직접 받습니다.
interface OrderDetailClientProps {
    orderId: string;
}

// --- 주문 상세 페이지 클라이언트 컴포넌트 ---
export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
    const [orderData, setOrderData] = useState<OrderResponseDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const { accessToken, hydrated } = useAuthStore();

    useEffect(() => {
        // hydrated 상태 확인 - 데이터 로딩이 완료되지 않았으면 대기
        if (!hydrated) {
            return;
        }

        // 토큰 확인
        if (!accessToken) {
            setError("로그인 토큰이 없습니다. 다시 로그인 해주세요.");
            setLoading(false);
            return;
        }

        // string 타입의 orderId를 number로 변환하여 API 호출에 사용합니다.
        const numericOrderId = Number(orderId);
        if (isNaN(numericOrderId) || numericOrderId <= 0) {
            setError("유효하지 않은 주문 ID입니다.");
            setLoading(false);
            return;
        }

        const getOrder = async () => {
            try {
                // 변환된 numericOrderId와 토큰을 사용하여 데이터 페칭
                const data = await fetchOrderDetail(numericOrderId, accessToken);
                setOrderData(data);
            } catch (err) {
                console.error("주문 상세 정보를 가져오는 데 실패:", err);
                setError(err instanceof Error ? err.message : "주문 상세 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        getOrder();
    }, [orderId, accessToken, hydrated]); // 의존성 배열 업데이트

    // --- 로딩, 에러, 데이터 없음 상태에 따른 UI 렌더링 ---
    if (loading) {
        return (
            <div>
                {/* <Navbar/> */}
                <div className="container mx-auto p-4 text-center font-inter">
                    <p>주문 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                {/* <Navbar/> */}
                <div className="container mx-auto p-4 font-inter">

                    <h1 className="text-3xl font-light mb-6 text-center text-gray-800">
                        주문 상세
                    </h1>
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
                        role="alert"
                    >
                        <strong className="font-light">오류: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div>
                {/* <Navbar/> */}

                <div className="container mx-auto p-4 text-center text-gray-700 font-inter">

                    <h1 className="text-3xl font-light mb-6">주문 상세</h1>
                    <p>주문 정보를 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    // --- 주문 상세 정보 UI 렌더링 (기존과 동일) ---
    return (
        <div>
            {/* <Navbar/> */}
            <div className="container mx-auto p-4 max-w-screen-lg bg-gray-50 min-h-screen font-inter">

                <h1 className="text-4xl font-light mb-8 text-center text-gray-900 leading-tight">
                    주문 상세 정보
                </h1>

                <div className="bg-white shadow-xl rounded-lg p-8 mb-8 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                        <div>
                            <p className="text-lg font-semibold mb-2">주문 번호: <span className="font-light text-blue-600">{orderData.orderId}</span></p>
                            <p className="text-lg font-semibold mb-2">고객 ID: <span className="font-light">{orderData.customerId}</span></p>
                            <p className="text-lg font-semibold mb-2">배송 주소: <span className="font-light">{orderData.deliveryAddress}</span></p>
                            <p className="text-lg font-semibold mb-2">총 주문 가격: <span className="font-light text-green-700">{orderData.totalPrice.toLocaleString()}원</span></p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold mb-2">주문 일시: <span className="font-light">{new Date(orderData.orderCreatedAt).toLocaleString()}</span></p>
                            <p className="text-lg font-semibold mb-2">최종 업데이트: <span className="font-light">{new Date(orderData.updatedAt).toLocaleString()}</span></p>
                            <p className="text-lg font-semibold mb-2">결제 방식: <span className="font-light">{orderData.paymentType}</span></p>
                            <p className="text-lg font-semibold mb-2">배송비: <span className="font-light">{orderData.deliveryFee.toLocaleString()}원</span></p>
                            <p className="text-lg font-semibold mb-2">수령인: <span className="font-light">{orderData.receiverName}</span></p>
                            <p className="text-lg font-semibold mb-2">연락처: <span className="font-light">{orderData.phone}</span></p>
                        </div>
                    </div>
                    <p className="text-lg font-semibold mt-4">
                        주문 상태:{" "}
                        <span
                            className={`relative inline-block px-4 py-1 font-light leading-tight rounded-full ${
                                orderData.orderStatus === "ORDER"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                {orderData.orderStatus === "ORDER" ? "주문 완료" : orderData.orderStatus === "CANCEL" ? "주문 취소" : orderData.orderStatus}
              </span>
                        <span className="ml-4 text-gray-600">({orderData.deliveryStatus})</span>
                    </p>
                </div>

                {/* 주문 상품 목록 */}
                <div className="bg-white shadow-xl rounded-lg p-8 border border-gray-200">
                    <h2 className="text-3xl font-light mb-6 text-gray-800 border-b pb-3">주문 상품 목록</h2>
                    {orderData.orderItems.length === 0 ? (
                        <p className="text-lg text-gray-600 text-center py-4">주문된 상품이 없습니다.</p>
                    ) : (
                        // 🔽 판매자 기준으로 그룹핑
                        Object.entries(
                            orderData.orderItems.reduce((acc, item) => {
                                if (!acc[item.sellerId]) {
                                    acc[item.sellerId] = {
                                        sellerName: item.sellerName,
                                        items: []
                                    };
                                }
                                acc[item.sellerId].items.push(item);
                                return acc;
                            }, {} as Record<string, { sellerName: string; items: OrderItemResponseDTO[] }>)
                        ).map(([sellerId, { sellerName, items }]) => (
                            <div key={sellerId} className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    🏬 판매자: {sellerName}
                                </h3>
                                <div className="space-y-6">
                                    {items.map((item) => (
                                        <div key={item.productId} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim() !== ''
                                                        ? item.imageUrl
                                                        : '/images/placeholder.png'}
                                                    alt={item.productName || "상품 이미지"}
                                                    width={96}
                                                    height={96}
                                                    className="rounded-lg object-cover w-24 h-24"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/placeholder.png';
                                                        e.currentTarget.onerror = null;
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-grow text-center md:text-left">
                                                <h4 className="text-xl font-semibold text-gray-800 mb-1">{item.productName}</h4>
                                                <p className="text-lg text-gray-600 mb-1">{item.quantity}개</p>
                                                <p className="text-xl font-light text-blue-700">{item.price.toLocaleString()}원</p>
                                            </div>
                                        </div>
                                    ))}
                                    {/* 🔽 해당 판매자에 대한 리뷰가 작성되지 않았을 경우만 버튼 표시 */}
                                    {!items[0].reviewWritten && (
                                        <div className="text-center mt-4">
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                onClick={() =>
                                                    router.push(`/customer/mypage/orders/${orderData.orderId}/reviews?sellerId=${sellerId}`)
                                                }
                                            >
                                                ✍️ 리뷰 작성하기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}