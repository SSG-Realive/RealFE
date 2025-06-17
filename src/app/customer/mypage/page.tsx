'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/customer/authStore';
import Navbar from '@/components/customer/Navbar';

export default function MyPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (mounted && !isAuthenticated()) {
            router.push('/customer/member/login?redirectTo=/customer/mypage');
        }
    }, [mounted, isAuthenticated, router]);

    if (!mounted || !isAuthenticated()) return null;

    return (
        <>
            <Navbar />
            <main className="max-w-3xl mx-auto p-6">
                <h1 className="text-xl font-bold mb-6">마이페이지</h1>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        className="bg-gray-100 p-4 rounded hover:bg-gray-200"
                        onClick={() => router.push('/customer/wishlist')}
                    >
                        ❤️ 찜 목록
                    </button>

                    <button
                        className="bg-gray-100 p-4 rounded hover:bg-gray-200"
                        onClick={() => router.push('/customer/review')}
                    >
                        ✍ 내 리뷰
                    </button>
                </div>
            </main>
        </>
    );
}
