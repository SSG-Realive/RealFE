'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/customer/authStore';
import { useCartStore } from '@/store/customer/useCartStore';
import { fetchMyProfile } from '@/service/customer/customerService';
import { loadTossPayments, DEFAULT_CONFIG } from '@/service/order/tossPaymentService';
import type { CartItem } from '@/types/customer/cart/cart';
import type { MemberReadDTO } from '@/types/customer/member/member';
import Navbar from '@/components/customer/common/Navbar';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string;

export default function NewOrderPage() {
    const router = useRouter();
    const { id: customerId, userName: initialName } = useAuthStore();
    const cartItems = useCartStore((state) => state.itemsForCheckout);

    const [userProfile, setUserProfile] = useState<MemberReadDTO | null>(null);
    const [shippingInfo, setShippingInfo] = useState({ receiverName: '', phone: '', address: '' });
    const [deliveryAddress, setDeliveryAddress] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [receiverName, setReceiverName] = useState<string>('');
    const tossPaymentsRef = useRef<any>(null);

    // 사용자 정보 로딩 및 장바구니 유효성 검사
    useEffect(() => {
        if (cartItems.length === 0) {
            alert("결제할 상품 정보가 없습니다. 장바구니 페이지로 돌아갑니다.");
            router.replace('/customer/cart');
            return;
        }

        fetchMyProfile().then(profile => {
            setUserProfile(profile);
            setShippingInfo({
                receiverName: profile.name || '',
                phone: profile.phone || '',
                address: profile.address || '',
            });
        }).catch(err => console.error("사용자 정보 조회 실패:", err));
    }, [cartItems, router]);

    // 최종 결제 금액 계산
    const { totalProductPrice, deliveryFee, finalAmount } = useMemo(() => {
        if (cartItems.length === 0) {
            return { totalProductPrice: 0, deliveryFee: 0, finalAmount: 0 };
        }
        const totalProductPrice = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
        const deliveryFee = 3000; // TODO: 실제 배송비 정책 적용
        const finalAmount = totalProductPrice + deliveryFee;
        return { totalProductPrice, deliveryFee, finalAmount };
    }, [cartItems]);

    // 토스페이먼츠 기본 SDK 초기화 (바로결제와 동일한 방식)
    useEffect(() => {
        if (!userProfile || !customerId || finalAmount === 0) return;

        const initializeTossPayments = async () => {
            try {
                console.log('토스페이먼츠 기본 SDK 초기화 시작...', { customerId, finalAmount });
                
                // 토스페이먼츠 객체 생성 (바로결제와 동일)
                if (!(window as any).TossPayments) {
                    const tossPayments = await loadTossPayments(DEFAULT_CONFIG.CLIENT_KEY);
                    tossPaymentsRef.current = tossPayments;
                } else {
                    const tossPayments = (window as any).TossPayments(DEFAULT_CONFIG.CLIENT_KEY);
                    tossPaymentsRef.current = tossPayments;
                }
                
                console.log('토스페이먼츠 기본 SDK 초기화 완료');
                
            } catch (error: any) {
                console.error("토스페이먼츠 기본 SDK 초기화 실패:", error);
            }
        };

        initializeTossPayments();
    }, [userProfile, customerId, finalAmount]);

    // 배송지 정보 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    // 결제하기 버튼 핸들러 (바로결제와 동일한 방식)
    const handlePayment = async () => {
        const tossPayments = tossPaymentsRef.current;
        if (!tossPayments || !userProfile) {
            alert("결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        if (!shippingInfo.receiverName || !shippingInfo.phone || !shippingInfo.address) {
            alert("배송지 정보를 모두 입력해주세요.");
            return;
        }

        const checkoutInfo = {
            orderItems: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
            shippingInfo: shippingInfo,
        };
        sessionStorage.setItem('checkout_info', JSON.stringify(checkoutInfo));
        
        const orderName = cartItems.length > 1
            ? `${cartItems[0].productName} 외 ${cartItems.length - 1}건`
            : cartItems[0].productName;

        const orderId = `cart_${new Date().getTime()}`;

        try {
            // 바로결제와 동일한 방식으로 결제 요청
            await tossPayments.requestPayment('카드', {
                amount: finalAmount,
                orderId: orderId,
                orderName: orderName,
                customerName: userProfile.name || initialName || '고객',
                successUrl: `${window.location.origin}/customer/orders/success`,
                failUrl: `${window.location.origin}/customer/orders/fail`,
            });
        } catch (error) {
            console.error("결제 요청 실패:", error);
            alert("결제에 실패했습니다. 다시 시도해주세요.");
        }
    };

    if (!userProfile) {
        return <div className="flex justify-center items-center h-screen">주문 정보를 준비 중입니다...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24 lg:pb-0">
            
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-6">주문 / 결제</h1>

                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">배송지</h2>
                        <div className="space-y-3">
                            <div><label className="text-sm font-medium text-gray-700">받는 분</label><input type="text" name="receiverName" value={shippingInfo.receiverName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                            <div><label className="text-sm font-medium text-gray-700">연락처</label><input type="text" name="phone" value={shippingInfo.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                            <div><label className="text-sm font-medium text-gray-700">주소</label><input type="text" name="address" value={shippingInfo.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                        </div>
                    </section>
                    
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.cartItemId} className="flex items-start space-x-4">
                                    <img src={item.imageThumbnailUrl || '/default-image.png'} alt={item.productName} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-grow"><p className="font-medium">{item.productName}</p><p className="text-sm text-gray-500">수량: {item.quantity}개</p></div>
                                    <p className="font-semibold whitespace-nowrap">{(item.productPrice * item.quantity).toLocaleString()}원</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">결제 금액</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span>총 상품금액</span><span>{totalProductPrice.toLocaleString()}원</span></div>
                            <div className="flex justify-between text-sm"><span>배송비</span><span>+ {deliveryFee.toLocaleString()}원</span></div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between font-bold text-base"><span>최종 결제 금액</span><span>{finalAmount.toLocaleString()}원</span></div>
                        </div>
                        <button className="w-full bg-green-500 text-white font-bold py-3 mt-4 rounded-md hover:bg-green-600 transition-colors" onClick={handlePayment} disabled={cartItems.length === 0}>
                            {finalAmount.toLocaleString()}원 결제하기
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
}