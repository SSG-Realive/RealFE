'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartListResponseDTO } from '@/types/cart/cartListResponseDTO';
import { CartItemUpdateRequestDTO } from '@/types/cart/cartItemUpdateRequestDTO';

async function CartPage() {
    const [cartData, setCartData] = useState<CartListResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // 장바구니 데이터 가져오기
    const fetchCartItems = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('장바구니 정보를 가져오는데 실패했습니다.');
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
    const handleQuantityChange = async (cartItemId: number, productId: number, newQuantity: number) => {
        try {
            const updateData: CartItemUpdateRequestDTO = {
                productId: productId,
                quantity: newQuantity
            };

            const response = await fetch(`http://localhost:8080/api/cart/${cartItemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('수량 변경에 실패했습니다.');
            }

            // 장바구니 목록 새로고침
            await fetchCartItems();
        } catch (err) {
            alert(err instanceof Error ? err.message : '수량 변경 중 오류가 발생했습니다.');
        }
    };

    // 장바구니 항목 삭제
    const handleRemoveItem = async (cartItemId: number) => {
        if (!confirm('정말로 이 상품을 장바구니에서 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/cart/${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('상품 삭제에 실패했습니다.');
            }

            // 장바구니 목록 새로고침
            await fetchCartItems();
        } catch (err) {
            alert(err instanceof Error ? err.message : '상품 삭제 중 오류가 발생했습니다.');
        }
    };

    // 장바구니 비우기
    const handleClearCart = async () => {
        if (!confirm('정말로 장바구니를 비우시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('장바구니 비우기에 실패했습니다.');
            }

            setCartData(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : '장바구니 비우기 중 오류가 발생했습니다.');
        }
    };

    // 결제 페이지로 이동
    const handlePayment = () => {
        router.push('/orders/cart-payment');
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">장바구니</h1>

            {!cartData || cartData.items.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">장바구니가 비어있습니다.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                        {cartData.items.map((item) => (
                            <div key={item.cartItemId} className="flex items-center py-4 border-b last:border-b-0">
                                {item.productImage && (
                                    <img
                                        src={item.productImage}
                                        alt={item.productName || '상품 이미지'}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                )}
                                <div className="ml-4 flex-grow">
                                    <h3 className="text-lg font-semibold">{item.productName}</h3>
                                    <p className="text-gray-600">{item.productPrice.toLocaleString()}원</p>
                                    <div className="flex items-center mt-2">
                                        <button
                                            onClick={() => item.productId && handleQuantityChange(item.cartItemId, item.productId, item.quantity - 1)}
                                            className="px-2 py-1 border rounded"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="mx-4">{item.quantity}</span>
                                        <button
                                            onClick={() => item.productId && handleQuantityChange(item.cartItemId, item.productId, item.quantity + 1)}
                                            className="px-2 py-1 border rounded"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(item.cartItemId)}
                                            className="ml-4 text-red-500 hover:text-red-700"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        {item.totalPrice.toLocaleString()}원
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={handleClearCart}
                            className="px-4 py-2 text-red-500 hover:text-red-700"
                        >
                            장바구니 비우기
                        </button>
                        <div className="text-xl font-bold">
                            총 금액: {cartData.totalCartPrice.toLocaleString()}원
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handlePayment}
                            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700"
                        >
                            결제하기
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CartPage;