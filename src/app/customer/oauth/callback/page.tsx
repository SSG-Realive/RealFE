'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/customer/authStore';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    console.log('=== 콜백 페이지 실행 ===');
    console.log('현재 URL:', window.location.href);

    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const isTemporaryUser = searchParams.get('temporaryUser') === 'true';
    // 만약 서버에서 id도 쿼리로 보내주면 이렇게 받기
    // const idParam = searchParams.get('id');
    // const id = idParam ? Number(idParam) : 0;

    console.log('받은 파라미터들:', { token: token?.substring(0, 20) + '...', email, isTemporaryUser });

    // sessionStorage에서 원래 페이지 URL 가져오기
    const originalUrl = sessionStorage.getItem('loginRedirectUrl');
    console.log('sessionStorage에서 가져온 원래 URL:', originalUrl);

    if (token && email) {
      setAuth({
        id: 0, // TODO: 서버에서 실제 id를 받으면 교체하세요
        accessToken: token,
        refreshToken: null, // 필요시 발급받아 저장
        email,
        userName: '', // 닉네임 없으면 빈 문자열
        temporaryUser: isTemporaryUser,
      });

      if (isTemporaryUser) {
        router.push('/customer/socialsignup');
      } else {
        router.push(originalUrl || '/');
      }
    }
  }, [searchParams, setAuth, router]);

  return <div>로그인 처리 중입니다...</div>;
}
