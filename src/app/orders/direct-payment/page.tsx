import { PayRequestDTO } from '@/types/orders/payRequestDTO';
import { cookies } from 'next/headers';

interface ErrorResponse {
    status: number;
    code: string;
    message: string;
}

async function DirectPaymentPage() {
    // 결제할 상품 정보를 백엔드에서 가져옵니다
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const orderInfoResponse = await fetch('http://localhost:8080/api/orders/direct-payment-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
    });

    if (!orderInfoResponse.ok) {
        const errorData: ErrorResponse = await orderInfoResponse.json();
        throw new Error(errorData.message);
    }

    const orderInfo = await orderInfoResponse.json();
    
    const payRequestDTO: PayRequestDTO = {
        productId: orderInfo.productId,
        quantity: orderInfo.quantity,
        // 옵션 2는 사용하지 않음
        orderItems: undefined,
        receiverName: orderInfo.receiverName,
        phone: orderInfo.phone,
        deliveryAddress: orderInfo.deliveryAddress,
        paymentMethod: "CARD"
    };

    // 결제 처리 함수
    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:8080/api/orders/direct-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payRequestDTO)
            });

            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(errorData.message);
            }

            const result = await response.json();
            // 결제 성공 후 처리 (예: 주문 완료 페이지로 이동)
            window.location.href = `/orders/complete/${result.orderId}`;
        } catch (error) {
            console.error('결제 처리 중 오류 발생:', error);
            alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                <form className="space-y-4" onSubmit={handlePayment}>
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