'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Heart,
    ShoppingCart,
    Package,
    Gavel,
    Clock3,
    UserCog,
    Star,
    ReceiptText,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { useAuthStore } from '@/store/customer/authStore';
import { customerBidService } from '@/service/customer/auctionService';
import type { Bid } from '@/types/customer/auctions';
import { useGlobalDialog } from '@/app/context/dialogContext';


/* ───────────────────────────────────────────────────────── */

export default function MyPage() {
    const router = useRouter();
    const { show } = useGlobalDialog();

    /* ---------------- 로그인 & 마운트 ---------------- */
    const isAuthenticatedFn = useAuthStore((s) => s.isAuthenticated);
    const userName = useAuthStore((s) => s.userName);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    /* ---------------- 슬라이더 상태 ---------------- */
    const ITEMS_PER_PAGE = 4;
    const [bids, setBids] = useState<Bid[]>([]);
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(bids.length / ITEMS_PER_PAGE);
    const canPrev = page > 0;
    const canNext = page < totalPages - 1;

    /* ---------------- Bid 데이터 로드 ---------------- */
    useEffect(() => {
        if (!isAuthenticatedFn()) return;

        (async () => {
            try {
                const res = await customerBidService.getMyBids({
                    page: 0,
                    size: 999,
                });
                setBids(res.content);
                if (res.content.length === 0) {
                    await show('현재 참여 중인 경매가 없습니다.');
                }
            } catch {
                await show('입찰 내역을 불러오지 못했습니다.');
            }
        })();
    }, [show, isAuthenticatedFn]);

    /* ---------------- 로그인 가드 ---------------- */
    useEffect(() => {
        if (mounted && !isAuthenticatedFn()) {
            router.push(
                '/customer/member/login?redirectTo=/customer/mypage',
            );
        }
    }, [mounted, isAuthenticatedFn, router]);

    /* ---------------- 터치 스와이프 ---------------- */
    const touchX = useRef(0);

    /* ---------------- 가드 조건 ---------------- */
    const notReady = !mounted || !isAuthenticatedFn();
    if (notReady) return null;

    /* ────────────────────── 렌더 ────────────────────── */
    return (
        <>
            <main className="min-h-screen py-5">
                <div className="max-w-6xl mx-auto bg-white rounded-xl px-6 pt-6">
                    {/* ===== 타이틀 ===== */}
                    <div className="relative mb-6">
                        <h1 className="text-xl font-light">마이페이지</h1>
                        {userName && (
                            <span className="absolute right-0 top-7 text-sm text-gray-500">
                                {userName}님, 환영합니다.
                            </span>
                        )}
                    </div>

                    <hr className="invisible mb-6" />

                    {/* ===== 주요 메뉴 ===== */}
                    <section className="mt-12 mb-20">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                            <CircleBtn label="구매내역" icon={<ReceiptText size={24} />} onClick={() => router.push('/customer/mypage/orders')} />
                            <CircleBtn label="찜 목록" icon={<Heart size={27} />} onClick={() => router.push('/customer/mypage/wishlist')} />
                            <CircleBtn label="장바구니" icon={<ShoppingCart size={27} />} onClick={() => router.push('/customer/cart')} />
                            <CircleBtn label="낙찰한 경매" icon={<Gavel size={27} />} onClick={() => router.push('/customer/member/auctions/won')} />
                            <CircleBtn label="개인정보" icon={<UserCog size={27} />} onClick={() => router.push('/customer/mypage/edit')} />
                            <CircleBtn label="리뷰" icon={<Star size={27} />} onClick={() => router.push('/customer/mypage/reviews')} />
                        </div>
                    </section>

                    {/* ===== 활동 정보 ===== */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 주문/배송 */}
                        <InfoCard icon={<Package size={20} />} title="주문 및 배송 현황">
                            최근 주문한 상품이 없습니다.
                        </InfoCard>

                        {/* 참여 중인 경매 슬라이더 */}
                        <div
                            className="bg-gray-50 rounded-xl p-5 cursor-pointer"

                        >
                            <div className="flex items-center mb-3 gap-2">
                                <Gavel className="text-gray-600" size={20} />
                                <h2 className="font-semibold text-base">참여 중인 경매</h2>
                            </div>

                            {bids.length === 0 ? (
                                <p className="text-sm text-gray-600">현재 참여 중인 경매가 없습니다.</p>
                            ) : (
                                <div className="relative">
                                    {/* ← / → 버튼 */}
                                    {canPrev && (
                                        <NavBtn dir="left" onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }} />
                                    )}
                                    {canNext && (
                                        <NavBtn dir="right" onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }} />
                                    )}

                                    {/* 슬라이더 트랙 */}
                                    <div
                                        className="overflow-hidden"
                                        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                                        onTouchEnd={(e) => {
                                            const dx = e.changedTouches[0].clientX - touchX.current;
                                            if (dx > 50 && canPrev) setPage(p => p - 1);
                                            if (dx < -50 && canNext) setPage(p => p + 1);
                                        }}
                                    >
                                        <div
                                            className="flex transition-transform duration-300"
                                            style={{ transform: `translateX(-${page * 100}%)` }}
                                        >
                                            {bids.map((b) => (
                                                /* 가로 100%를 차지하는 row */
                                                <div key={b.id} className="shrink-0 w-full px-1">
                                                    <div className="w-[95%] md:w-[92%] mx-auto
                bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow
                              flex items-center justify-between">
                                                        {/* 왼쪽: 경매 번호 & 배지 */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">
                                                                #{b.auctionId}
                                                            </span>
                                                            <span
                                                                className={`text-[11px] font-semibold px-2 py-[1px] rounded-full
                      ${b.leading
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-red-100 text-red-700'}`}
                                                            >
                                                                {b.leading ? '상위 입찰' : '경쟁 중'}
                                                            </span>
                                                        </div>

                                                        {/* 가운데: 내 입찰가 */}
                                                        <p className="text-sm font-light">
                                                            {b.bidPrice.toLocaleString()}원
                                                        </p>


                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => router.push('/customer/mypage/bids')}
                                className="mt-2 ml-auto text-xs text-gray-500 hover:text-gray-700
               flex items-center gap-1"
                            >전체 보기&nbsp;&rarr;
                                <ChevronRight size={12} />
                            </button>
                        </div>

                        {/* 최근 본 상품 */}
                        <InfoCard icon={<Clock3 size={20} />} title="최근 본 상품">
                            최근 본 상품이 없습니다.
                        </InfoCard>
                    </section>
                </div>
            </main>
        </>
    );
}

/* ───────── 헬퍼 컴포넌트 ───────── */

function CircleBtn({
    label,
    icon,
    onClick,
}: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            className="flex flex-col items-center justify-center w-24 h-24 rounded-full
                 bg-black text-white hover:bg-gray-800 transition"
            onClick={onClick}
        >
            {icon}
            <span className="text-sm mt-1">{label}</span>
        </button>
    );
}

function InfoCard({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center mb-3 gap-2">
                {icon}
                <h2 className="font-semibold text-base">{title}</h2>
            </div>
            <p className="text-sm text-gray-600">{children}</p>
        </div>
    );
}

function NavBtn({
    dir,
    onClick,
}: {
    dir: 'left' | 'right';
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
    return (
        <button
            onClick={onClick}
            className={`absolute top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-1
                md:flex hidden z-20
                  ${dir === 'left' ? '-left-3' : '-right-3'}`}
        >
            {dir === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
    );
}
