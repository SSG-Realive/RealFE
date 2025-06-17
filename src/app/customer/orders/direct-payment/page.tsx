import { PayRequestDTO } from '@/types/orders/payRequestDTO';
import { cookies } from 'next/headers';
import React from 'react'; // 'use client'를 사용한다면 React import
import { redirect } from 'next/navigation'; // redirect import 추가

interface ErrorResponse {
    status: number;
    code: string;
    message: string;
}

// 이 컴포넌트는 기본적으로 서버 컴포넌트입니다.
async function DirectPaymentPage() {
    // 서버 컴포넌트이므로, cookies는 서버에서만 접근 가능합니다.
    const cookieStore = await cookies(); // 이곳은 이미 await이 적용되어 있습니다.
    const token = cookieStore.get('token')?.value;

    // 결제할 상품 정보를 백엔드에서 가져옵니다
    const orderInfoResponse = await fetch('http://localhost:8080/api/customer/orders/direct-payment-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
    });

    if (!orderInfoResponse.ok) {
        const errorData: ErrorResponse = await orderInfoResponse.json();
        throw new Error(`상품 정보를 불러오는 데 실패했습니다: ${errorData.message}`);
    }

    const orderInfo = await orderInfoResponse.json();

    const payRequestDTO: PayRequestDTO = {
        productId: orderInfo.productId,
        quantity: orderInfo.quantity,
        orderItems: undefined, // 단일 상품 바로 구매이므로 사용하지 않음
        receiverName: orderInfo.receiverName,
        phone: orderInfo.phone,
        deliveryAddress: orderInfo.deliveryAddress,
        paymentMethod: "CARD" // 예시로 카드 결제 방식 설정
    };

    // 결제 처리 함수 (Next.js Server Action)
    const handlePayment = async (formData: FormData) => {
        'use server'; // 서버 액션임을 명시

        // --- 문제 발생 지점 수정 ---
        const cookieStore = await cookies(); // 여기도 await을 추가해야 합니다!
        const tokenInAction = cookieStore.get('token')?.value; // 이제 'get' 메서드에 접근 가능

        // 폼 데이터에서 필요한 정보 추출 (실제 결제 정보를 PayRequestDTO에 포함시켜야 합니다.)
        // 예: const cardNumber = formData.get('cardNumber') as string;

        const updatedPayRequestDTO: PayRequestDTO = {
            ...payRequestDTO,
            // 여기에 실제 폼 입력값을 추가할 수 있습니다. (예: 카드 번호, 유효 기간, CVC 등)
        };

        try {
            const response = await fetch('http://localhost:8080/api/customer/orders/direct-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenInAction ? `Bearer ${tokenInAction}` : '' // 서버 액션 내에서 가져온 토큰 사용
                },
                body: JSON.stringify(updatedPayRequestDTO)
            });

            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(`결제 처리 실패: ${errorData.message}`);
            }

            const orderId = await response.json();
            console.log('결제가 성공적으로 처리되었습니다. 주문 ID:', orderId);

            // 결제 성공 후 주문 상세 페이지 등으로 리다이렉트
            redirect(`/customer/orders/${orderId}`); // orderId가 바로 반환된다고 가정
        } catch (error) {
            console.error('결제 처리 중 오류 발생:', error);
            // 사용자에게 오류 메시지를 전달하는 방식은 Next.js Server Actions의 에러 핸들링을 따릅니다.
            throw new Error(`결제 처리 중 오류가 발생했습니다: ${(error as Error).message}`);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">결제</h1>

            {/* 주문 정보 요약 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">주문 정보</h2>
                <div className="space-y-2">
                    <p><span className="font-medium">상품명:</span> {orderInfo.productName}</p>
                    <p><span className="font-medium">수량:</span> {orderInfo.quantity}개</p>
                    <p><span className="font-medium">수령인:</span> {orderInfo.receiverName}</p>
                    <p><span className="font-medium">연락처:</span> {orderInfo.phone}</p>
                    <p><span className="font-medium">배송지:</span> {orderInfo.deliveryAddress}</p>
                </div>
            </div>

            {/* 결제 정보 입력 폼 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">결제 정보</h2>
                {/* Next.js Server Action을 사용하려면 action prop에 함수를 넘깁니다. */}
                <form className="space-y-4" action={handlePayment}>
                    {/* 카드 번호 입력 */}
                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            카드 번호
                        </label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="1234-5678-1234-5678"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={19}
                            required
                        />
                    </div>

                    {/* 카드 유효기간 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                                유효기간 (월)
                            </label>
                            <input
                                type="text"
                                id="expiryMonth"
                                name="expiryMonth"
                                placeholder="MM"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={2}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                                유효기간 (년)
                            </label>
                            <input
                                type="text"
                                id="expiryYear"
                                name="expiryYear"
                                placeholder="YY"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={2}
                                required
                            />
                        </div>
                    </div>

                    {/* CVC */}
                    <div>
                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                            CVC
                        </label>
                        <input
                            type="text"
                            id="cvc"
                            name="cvc"
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={3}
                            required
                        />
                    </div>

                    {/* 결제 금액 */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>결제 금액</span>
                            <span>{orderInfo.totalPrice?.toLocaleString()}원</span>
                        </div>
                    </div>

                    {/* 결제 버튼 */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        결제하기
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DirectPaymentPage;