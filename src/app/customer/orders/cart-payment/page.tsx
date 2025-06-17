import { PayRequestDTO } from '@/types/orders/payRequestDTO';
import { ProductQuantityDTO } from '@/types/orders/productQuantityDTO';
import { cookies } from 'next/headers';

interface ErrorResponse {
    status: number;
    code: string;
    message: string;
}

async function CartPaymentPage() {
    // 장바구니 데이터를 백엔드에서 가져옵니다
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const cartResponse = await fetch('http://localhost:8080/api/cart', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
    });

    if (!cartResponse.ok) {
        const errorData: ErrorResponse = await cartResponse.json();
        throw new Error(errorData.message);
    }

    const cartData = await cartResponse.json();
    
    // 장바구니 데이터를 PayRequestDTO 형식으로 변환
    const orderItems: ProductQuantityDTO[] = cartData.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity
    }));

    const payRequestDTO: PayRequestDTO = {
        orderItems: orderItems,
        // 옵션 1은 사용하지 않음
        productId: undefined,
        quantity: undefined,
        receiverName: cartData.receiverName,
        phone: cartData.phone,
        deliveryAddress: cartData.deliveryAddress,
        paymentMethod: "CARD"
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">결제</h1>
            
            {/* 주문 정보 요약 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">주문 정보</h2>
                <div className="space-y-2">
                    <p><span className="font-medium">수령인:</span> {cartData.receiverName}</p>
                    <p><span className="font-medium">연락처:</span> {cartData.phone}</p>
                    <p><span className="font-medium">배송지:</span> {cartData.deliveryAddress}</p>
                </div>
            </div>

            {/* 결제 정보 입력 폼 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">결제 정보</h2>
                <form className="space-y-4">
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
                        />
                    </div>

                    {/* 결제 금액 */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>결제 금액</span>
                            <span>{cartData.totalPrice?.toLocaleString()}원</span>
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

export default CartPaymentPage;