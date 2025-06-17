'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartListResponseDTO } from '@/types/cart/cartListResponseDTO';
import { CartItemUpdateRequestDTO } from '@/types/cart/cartItemUpdateRequestDTO';

function CartPage() {
    const [cartData, setCartData] = useState<CartListResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // 장바구니 데이터 가져오기
    const fetchCartItems = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/customer/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // 백엔드가 200 OK와 함께 빈 리스트 또는 데이터 반환 예상
            if (!response.ok) {
                // 200 OK가 아닌 경우 (예: 401 Unauthorized, 500 Internal Server Error 등)
                // 백엔드가 장바구니 없을 때 404나 204를 보낸다면 이 부분을 조정해야 합니다.
                // 현재 컨트롤러는 200 OK에 빈 배열을 보낼 가능성이 높습니다.
                throw new Error('장바구니 정보를 가져오는데 실패했습니다. 상태 코드: ' + response.status);
            }

            const data: CartListResponseDTO = await response.json();
            setCartData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 수량 변경 처리
    const handleQuantityChange = async (cartItemId: number, productId: number | null, newQuantity: number) => {
        if (productId === null) {
            alert('상품 ID를 찾을 수 없어 수량을 변경할 수 없습니다.');
            return;
        }
        if (newQuantity < 0) return;

        try {
            const updateData: CartItemUpdateRequestDTO = {
                productId: productId,
                quantity: newQuantity
            };

            const response = await fetch(`http://localhost:8080/api/customer/cart/${cartItemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                // 204 No Content가 아닌 다른 실패 코드 (예: 400 Bad Request, 500 Internal Server Error)
                throw new Error('수량 변경에 실패했습니다. 상태 코드: ' + response.status);
            }

            // 백엔드가 204 No Content를 보낼 경우 (수량이 0이 되어 삭제될 때)
            // response.json()을 호출하면 에러가 발생하므로 조건부 호출
            // if (response.status !== 204) {
            //     const data: CartItemResponseDTO = await response.json();
            //     // 필요하다면 여기에서 특정 항목만 업데이트
            // }

            // 수량 변경 또는 삭제 후 항상 전체 목록 새로고침
            await fetchCartItems();
        } catch (err) {
            alert(err instanceof Error ? err.message : '수량 변경 중 오류가 발생했습니다.');
        }
    };

    // 장바구니 항목 삭제 (개별 상품 삭제)
    const handleRemoveItem = async (cartItemId: number) => {
        if (!confirm('정말로 이 상품을 장바구니에서 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/customer/cart/${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('상품 삭제에 실패했습니다. 상태 코드: ' + response.status);
            }
            // 204 No Content 응답이므로 response.json()은 필요 없음

            await fetchCartItems();
        } catch (err) {
            alert(err instanceof Error ? err.message : '상품 삭제 중 오류가 발생했습니다.');
        }
    };

    // 장바구니 비우기 활성화
    const handleClearCart = async () => {
        if (!confirm('정말로 장바구니를 모두 비우시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/customer/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('장바구니 비우기에 실패했습니다. 상태 코드: ' + response.status);
            }
            // 204 No Content 응답이므로 response.json()은 필요 없음

            setCartData({ items: [], totalItems: 0, totalCartPrice: 0 });
            alert('장바구니가 성공적으로 비워졌습니다.');
        } catch (err) {
            alert(err instanceof Error ? err.message : '장바구니 비우기 중 오류가 발생했습니다.');
        }
    };

    // 결제 페이지로 이동
    const handlePayment = () => {
        if (!cartData || cartData.items.length === 0) {
            alert('장바구니에 상품이 없습니다.');
            return;
        }
        router.push('/orders/cart-payment');
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-gray-700">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center py-10">
            <div className="w-full max-w-4xl mt-8">
                <div className="bg-gray-300 w-full py-4 text-center text-xl font-bold text-gray-800 mb-8">
                    장바구니
                </div>

                {!cartData || cartData.items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center py-8">
                        <p className="text-gray-500">장바구니가 비어있습니다.</p>
                        <button
                            onClick={handlePayment}
                            className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-md disabled:opacity-50"
                            disabled={true}
                        >
                            결제하기
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-md">
                            {cartData.items.map((item) => (
                                <div key={item.cartItemId} className="flex items-center py-4 px-6 border-b last:border-b-0">
                                    <div className="w-6 h-6 border-2 border-gray-300 bg-gray-200 mr-4 flex-shrink-0"></div>

                                    <div className="w-32 h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-sm flex-shrink-0">
                                        {item.productImage ? (
                                            <img
                                                src={item.productImage}
                                                alt={item.productName || '상품 이미지'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            '사진 / 영상'
                                        )}
                                    </div>
                                    <div className="ml-6 flex-grow flex items-center justify-between">
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-semibold text-gray-800">상품 이름: {item.productName || '알 수 없는 상품'}</h3>
                                            <p className="text-gray-600 mt-1">수량: {item.quantity} | 가격: {(item.productPrice || 0).toLocaleString()}원</p>
                                            <p className="font-semibold mt-1">총 가격: {(item.totalPrice || 0).toLocaleString()}원</p>
                                        </div>

                                        <div className="flex-shrink-0 ml-8 flex flex-col space-y-2">
                                            <div className="flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                                                <button
                                                    onClick={() => item.productId !== null && handleQuantityChange(item.cartItemId, item.productId, item.quantity - 1)}
                                                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                                                    disabled={item.quantity <= 0}
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-2 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => item.productId !== null && handleQuantityChange(item.cartItemId, item.productId, item.quantity + 1)}
                                                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(item.cartItemId)}
                                                className="bg-red-500 text-white w-24 h-10 flex items-center justify-center rounded hover:bg-red-600"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center w-full mt-8 px-6 py-4 bg-white rounded-lg shadow-md">
                            <button
                                onClick={handleClearCart}
                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
                            >
                                장바구니 비우기
                            </button>
                            <div className="text-2xl font-bold text-gray-800">
                                총 금액: {cartData.totalCartPrice.toLocaleString()}원
                            </div>
                            <button
                                onClick={handlePayment}
                                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-semibold"
                            >
                                결제하기
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CartPage;