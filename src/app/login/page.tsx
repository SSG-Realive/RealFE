'use client';

import { User, Store } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}

export default async function IntegratedLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo || '';

  const customerLoginUrl = `/customer/member/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`;
  const sellerLoginUrl = `/seller/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`;

  return (
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">
      {/* 💫 배경 패턴 (선택) */}
        <div className="absolute inset-0 bg-[url('/images/login-pattern.svg')] bg-cover bg-center opacity-5 pointer-events-none z-0" />

        {/* 💡 콘텐츠 */}
        <div className="z-10 w-full max-w-2xl text-center space-y-10">

          {/* 🎯 상단 로고 및 소개 */}
          <div className="space-y-3">
            <Image
                src="/images/logo.png"
                alt="Realive 로고"
                width={160}
                height={160}
                className="mx-auto"
            />
            <p className="text-gray-500 text-sm md:text-base">
              1인 가구를 위한 중고 가구 거래 플랫폼
            </p>
          </div>

          {/* 🎯 계정 선택 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href={customerLoginUrl} className="group">
              <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer h-full">
                <div className="flex justify-center mb-4">
                  <User className="h-14 w-14 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">고객</h2>
                <p className="text-sm text-gray-500 mt-2">상품을 탐색하고 구매해보세요</p>
              </div>
            </Link>

            <Link href={sellerLoginUrl} className="group">
              <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer h-full">
                <div className="flex justify-center mb-4">
                  <Store className="h-14 w-14 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">판매자</h2>
                <p className="text-sm text-gray-500 mt-2">상품을 등록하고 거래를 시작하세요</p>
              </div>
            </Link>
          </div>

          {/* 🧾 하단 슬로건 */}
          <p className="text-sm text-gray-400 mt-10">믿을 수 있는 중고거래, Realive에서 시작하세요.</p>
          <footer className="text-xs text-gray-300 mt-4">© 2025 Realive. All rights reserved.</footer>
        </div>
      </main>
  );
}
