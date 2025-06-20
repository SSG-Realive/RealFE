// app/orders/new/page.tsx (사용자 DTO 및 경로 반영 최종본)

'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/customer/authStore';
import { fetchMyProfile } from '@/service/customer/customerService';
import { fetchCartList } from '@/service/customer/cartService'; // ✨ 1. import 경로 수정
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import type { CartItem } from '@/types/customer/cart/cart'; // ✨ 제공해주신 CartItem 타입 사용
import { MemberReadDTO } from '@/types/customer/member/member';

import './OrderPage.css';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string;

export default function NewOrderPage() {
    const router = useRouter();
    const { id: customerId, userName: initialName } = useAuthStore();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userProfile, setUserProfile] = useState<MemberReadDTO | null>(null);
    const [shippingInfo, setShippingInfo] = useState({ receiverName: '', phone: '', address: '' });
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);

    useEffect(() => {
        fetchCartList()
            .then(items => setCartItems(items.filter(item => (item as any).selected))) // 'selected' 속성이 있다면 필터링
            .catch(err => console.error("장바구니 정보 조회 실패:", err));

        fetchMyProfile().then(profile => {
            setUserProfile(profile);
            setShippingInfo({
                receiverName: profile.name || '',
                phone: profile.phone || '',
                address: profile.address || '',
            });
        });
    }, []);

    const { totalProductPrice, deliveryFee, finalAmount } = useMemo(() => {
        if (cartItems.length === 0) {
            return { totalProductPrice: 0, deliveryFee: 0, finalAmount: 0 };
        }
        // ✨ 2. productPrice 필드명으로 수정
        const totalProductPrice = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
        const deliveryFee = 3000;
        const finalAmount = totalProductPrice + deliveryFee;
        return { totalProductPrice, deliveryFee, finalAmount };
    }, [cartItems]);

    useEffect(() => {
        if (cartItems.length === 0 || !userProfile || !customerId || finalAmount === 0) return;

        const initializeWidget = async () => {
            const tossPayments = await loadPaymentWidget(TOSS_CLIENT_KEY, customerId.toString());
            tossPayments.renderPaymentMethods('#payment-widget', { value: finalAmount });
            tossPayments.renderAgreement('#agreement');
            paymentWidgetRef.current = tossPayments;
        };
        initializeWidget();
    }, [cartItems, userProfile, customerId, finalAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = async () => {
        const paymentWidget = paymentWidgetRef.current;
        if (!paymentWidget || cartItems.length === 0 || !userProfile) return;

        const checkoutInfo = {
            orderItems: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
            shippingInfo: shippingInfo,
        };
        sessionStorage.setItem('checkout_info', JSON.stringify(checkoutInfo));
        
        const orderName = cartItems.length > 1
            ? `${cartItems[0].productName} 외 ${cartItems.length - 1}건`
            : cartItems[0].productName;

        try {
            await paymentWidget.requestPayment({
                orderId: `order_${new Date().getTime()}`,
                orderName: orderName,
                customerName: userProfile.name || initialName || '고객',
                successUrl: `${window.location.origin}/orders/success`,
                failUrl: `${window.location.origin}/orders/fail`,
            });
        } catch (error) {
            console.error("결제 요청 실패:", error);
            alert("결제에 실패했습니다. 다시 시도해주세요.");
        }
    };

    if (cartItems.length === 0 || !userProfile) {
        return <div className="loading-container">주문 정보를 불러오는 중입니다...</div>;
    }

    return (
        <main className="order-page-container">
            <h1 className="page-title">주문 / 결제</h1>

            <section className="order-section">
                <h2>주문 상품</h2>
                {cartItems.map(item => (
                    <div key={item.cartItemId} className="product-summary-card">
                        {/* ✨ 3. imageThumbnailUrl 필드명으로 수정 */}
                        <img src={item.imageThumbnailUrl || '/default-image.png'} alt={item.productName} />
                        <div className="product-details">
                            <p>{item.productName}</p>
                            <p>수량: {item.quantity}개</p>
                        </div>
                        {/* ✨ 4. productPrice 필드명으로 수정 */}
                        <p className="product-price">{(item.productPrice * item.quantity).toLocaleString()}원</p>
                    </div>
                ))}
            </section>
            
            <section className="order-section"><h2>주문자 정보</h2>{/*... */}</section>
            <section className="order-section"><h2>배송지 정보</h2>{/*... */}</section>
            <section className="order-section">
                <h2>결제 수단</h2>
                <div id="payment-widget" style={{ width: '100%' }} />
            </section>
            
            <aside className="order-summary-box">
                <div id="agreement" />
                <h3>결제 금액</h3>
                <div className="summary-row">
                    <span>총 상품금액</span>
                    <span>{totalProductPrice.toLocaleString()}원</span>
                </div>
                <div className="summary-row">
                    <span>배송비</span>
                    <span>+ {deliveryFee.toLocaleString()}원</span>
                </div>
                <div className="summary-row total">
                    <span>최종 결제 금액</span>
                    <span>{finalAmount.toLocaleString()}원</span>
                </div>
                <button className="payment-button" onClick={handlePayment} disabled={cartItems.length === 0}>
                    {finalAmount.toLocaleString()}원 결제하기
                </button>
            </aside>
        </main>
    );
}