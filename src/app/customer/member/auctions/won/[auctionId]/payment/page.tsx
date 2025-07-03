// src/app/customer/member/auctions/won/[auctionId]/payment/page.tsx
'use client';

import { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { customerApi } from '@/lib/apiClient';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useGlobalDialog } from '@/app/context/dialogContext';

/* ────────────────  타입  ──────────────── */
interface AuctionWinInfo {
  auctionId: number;
  productName: string;
  productImageUrl: string | null;
  winningBidPrice: number;
  isPaid: boolean;
}

interface UserProfile {
  receiverName: string;
  phone: string;
  deliveryAddress: string;
}

interface AuctionPaymentRequestDTO {
  auctionId: number;
  paymentKey: string;
  tossOrderId: string;
  amount: number;
  receiverName: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: 'CARD' | 'CELL_PHONE' | 'ACCOUNT';
}

/* ────────────  API 함수  ──────────── */
const fetchAuctionWinInfo = async (auctionId: string): Promise<AuctionWinInfo> => {
  const res = await customerApi.get(`/customer/auction-wins/${auctionId}`);
  return res.data.data;
};

const fetchMyProfile = async (): Promise<UserProfile> => {
  const res = await customerApi.get('/customer/me');        // 단수형
  return res.data as UserProfile;                           // → 응답 구조에 맞게
};

const processAuctionPaymentApi = async (
  auctionId: string,
  data: AuctionPaymentRequestDTO
) => {
  const res = await customerApi.post(
    `/customer/auction-wins/${auctionId}/payment`,
    data
  );
  return res.data;
};

/* ───────────────  본문 컴포넌트  ─────────────── */
function AuctionPaymentComponent() {
  const router = useRouter();
  const { auctionId } = useParams<{ auctionId: string }>();
  const { show: showDialog } = useGlobalDialog();
  /* 상태 */
  const [auctionInfo, setAuctionInfo] = useState<AuctionWinInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const tossPaymentsRef = useRef<any>(null);
  
  /* 데이터 로드 */
  useEffect(() => {
    if (!auctionId) return;
    const loadData = async () => {
      try {
        setLoading(true);

        const [winInfo, profile] = await Promise.all([
          fetchAuctionWinInfo(auctionId),
          fetchMyProfile(),
        ]);

        console.log('[winInfo]', winInfo);
        console.log('[profile]', profile);

        if (winInfo.isPaid) {
           await showDialog('이미 결제가 완료된 상품입니다.');
          router.replace('/customer/member/auctions/won');
          return;
        }

        setAuctionInfo(winInfo);
        setUserProfile(profile);
        setShippingInfo({
          receiverName: profile.receiverName ?? '',
          phone: profile.phone ?? '',
          address: profile.deliveryAddress ?? '',
        });
      } catch (err) {
        console.error(err);
         await showDialog('결제 정보를 불러오지 못했습니다.');
        router.replace('/customer/member/auctions/won');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [auctionId, router]);

  /* 결제 금액 계산 */
  const { deliveryFee, finalAmount } = useMemo(() => {
    if (!auctionInfo) return { deliveryFee: 0, finalAmount: 0 };
    const deliveryFee = 3000;
    return { deliveryFee, finalAmount: auctionInfo.winningBidPrice + deliveryFee };
  }, [auctionInfo]);

  /* TossPayments 초기화 (SDK 로드 후) */
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !userProfile || !auctionInfo) return;
    if (!(window as any).TossPayments) return;

    try {
      tossPaymentsRef.current = (window as any).TossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );
      console.log('[Toss] init OK', {
        clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
        ref: tossPaymentsRef.current,
      });
    } catch (e) {
      console.error('[Toss] init fail', e);
    }
  }, [scriptLoaded, userProfile, auctionInfo]);

  /* 입력 핸들러 */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* 결제 실행 */
  const handlePayment = async () => {
    // 디버그 출력
    console.log({
      scriptLoaded,
      tossFunc: typeof (window as any).TossPayments,
      ref: tossPaymentsRef.current,
    });

    if (!tossPaymentsRef.current || !auctionInfo) {
      // 마지막 방어: 즉석 초기화 시도
      if ((window as any).TossPayments) {
        try {
          tossPaymentsRef.current = (window as any).TossPayments(
            process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
          );
        } catch (e) {
           await showDialog('결제 시스템 초기화 실패');
          return;
        }
      } else {
         await showDialog('결제 시스템이 준비되지 않았습니다.');
        return;
      }
    }

    if (!shippingInfo.receiverName || !shippingInfo.phone || !shippingInfo.address) {
       await showDialog('배송지 정보를 모두 입력해주세요.');
      return;
    }

    const checkoutInfo = {
      type: 'AUCTION',
      auctionId: auctionInfo?.auctionId,
      shippingInfo,
    };
    sessionStorage.setItem(
      `checkout_auction_${auctionId}`,
      JSON.stringify(checkoutInfo)
    );

    try {
      await tossPaymentsRef.current.requestPayment('카드', {
        amount: finalAmount,
        orderId: `auction_${auctionId}_${Date.now()}`,
        orderName: `${auctionInfo?.productName} 경매 낙찰`,
        customerName: shippingInfo.receiverName,
        successUrl: `${window.location.origin}/customer/member/auctions/won/${auctionId}/payment/success`,
        failUrl: `${window.location.origin}/customer/member/auctions/won/${auctionId}/payment/fail`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center py-20">주문 정보를 준비 중입니다...</div>;
  if (!auctionInfo) return <div className="text-center py-20">결제할 상품 정보가 없습니다.</div>;

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light mb-6">경매 상품 결제</h1>

        {/* 배송지 */}
        <section className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="text-lg font-semibold mb-4">배송지</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">받는 분</label>
              <input
                type="text"
                name="receiverName"
                value={shippingInfo.receiverName}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">연락처</label>
              <input
                type="text"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">주소</label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
              />
            </div>
          </div>
        </section>

        {/* 주문 상품 */}
        <section className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
          <div className="flex items-start gap-4">
            <img
              src={auctionInfo.productImageUrl || '/images/default-product.png'}
              alt={auctionInfo.productName}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-grow">
              <p>{auctionInfo.productName}</p>
            </div>
            <p className="font-semibold">
              {auctionInfo.winningBidPrice.toLocaleString()}원
            </p>
          </div>
        </section>

        {/* 결제 금액 */}
        <section className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">결제 금액</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>낙찰가</span>
              <span>{auctionInfo.winningBidPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span>배송비</span>
              <span>+ {deliveryFee.toLocaleString()}원</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>최종 결제 금액</span>
              <span>{finalAmount.toLocaleString()}원</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white py-3 mt-4 rounded hover:bg-blue-700"
          >
            {finalAmount.toLocaleString()}원 결제하기
          </button>
        </section>
      </main>
    </div>
  );
}

/* ───────────────  결제 결과 컴포넌트  ─────────────── */
function PaymentResultHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auctionId } = useParams<{ auctionId: string }>();

  const [status, setStatus] = useState<'PROCESSING' | 'SUCCESS' | 'ERROR'>(
    'PROCESSING'
  );
  const [message, setMessage] = useState('결제 승인 중입니다...');

  useEffect(() => {
    const approve = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = Number(searchParams.get('amount'));

      if (!paymentKey || !orderId || !amount) {
        setStatus('ERROR');
        setMessage('결제 정보가 올바르지 않습니다.');
        return;
      }

      const checkoutInfoStr = sessionStorage.getItem(
        `checkout_auction_${auctionId}`
      );
      if (!checkoutInfoStr) {
        setStatus('ERROR');
        setMessage('결제 세션이 만료되었습니다.');
        return;
      }
      const checkoutInfo = JSON.parse(checkoutInfoStr);

      try {
        const req: AuctionPaymentRequestDTO = {
          auctionId: Number(auctionId),
          paymentKey,
          tossOrderId: orderId,
          amount,
          receiverName: checkoutInfo.shippingInfo.receiverName,
          phone: checkoutInfo.shippingInfo.phone,
          deliveryAddress: checkoutInfo.shippingInfo.address,
          paymentMethod: 'CARD',
        };
        const res = await processAuctionPaymentApi(auctionId, req);

        if (res.success) {
          setStatus('SUCCESS');
          setMessage('결제가 성공적으로 완료되었습니다!');
          sessionStorage.removeItem(`checkout_auction_${auctionId}`);
        } else {
          throw new Error(res.error?.message || '결제 승인 실패');
        }
      } catch (err: any) {
        setStatus('ERROR');
        setMessage(err.response?.data?.error?.message || err.message);
      }
    };
    approve();
  }, [auctionId, searchParams]);

  return (
    <div className="text-center py-20">
      <h2
        className={`text-2xl font-semibold ${
          status === 'SUCCESS'
            ? 'text-green-600'
            : status === 'ERROR'
            ? 'text-red-500'
            : 'text-gray-700'
        }`}
      >
        {status === 'SUCCESS'
          ? '결제 완료'
          : status === 'ERROR'
          ? '결제 실패'
          : '결제 처리 중'}
      </h2>
      <p className="mt-2 text-gray-600">{message}</p>
      <div className="mt-6">
        {status === 'SUCCESS' && (
          <Link href="/customer/mypage/orders">
            <button className="px-6 py-2 bg-blue-600 text-white rounded">
              주문 내역 확인
            </button>
          </Link>
        )}
        {status === 'ERROR' && (
          <Link href={`/customer/member/auctions/won/${auctionId}/payment`}>
            <button className="px-6 py-2 bg-gray-600 text-white rounded">
              결제 다시 시도
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ───────────────  Wrapper  ─────────────── */
export default function AuctionPaymentPageWrapper() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const pathname = usePathname();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  if (isLoading) return <div className="text-center py-20">인증 정보를 확인 중입니다...</div>;
  if (!isAuthenticated) return null;

  const isResult = pathname.endsWith('/success') || pathname.endsWith('/fail');

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
      />
      <Suspense fallback={<div className="text-center py-20">로딩 중...</div>}>
        {isResult ? (
          <PaymentResultHandler />
        ) : scriptLoaded && typeof window !== 'undefined' && (window as any).TossPayments ? (
          <AuctionPaymentComponent />
        ) : (
          <div className="text-center py-20">결제 모듈을 불러오는 중...</div>
        )}
      </Suspense>
    </>
  );
}
