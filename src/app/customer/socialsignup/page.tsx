'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/customer/authStore';
import SocialSignupForm from '@/components/customer/join/SocialSignupForm';

export default function SocialSignupPage() {
  const router = useRouter();
  const {
    email,
    accessToken,
    refreshToken,
    isTemporaryUser,
    setUserName,
    setAuth,
  } = useAuthStore();

  useEffect(() => {
    if (!email || !accessToken || !isTemporaryUser) {
      router.replace('/');
    }
  }, [email, accessToken, isTemporaryUser, router]);

  const handleSuccess = (name: string) => {
    setUserName(name);
    setAuth({
      accessToken: accessToken || '',
      refreshToken: refreshToken || null,
      email: email || '',
      name,
      temporaryUser: false,
    });
    alert('회원가입이 완료되었습니다!');
    router.push('/');
  };

  if (!email || !accessToken || !isTemporaryUser) return null;

  return (
    <div>
      <h1>추가 정보 입력</h1>
      <SocialSignupForm
        email={email}
        token={accessToken}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
