// src/app/components/SellerHeader.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProfile, logout } from '@/service/sellerService';
import { useEffect, useState } from 'react';
<<<<<<< HEAD:src/components/Header.tsx
import React from 'react';

const Header = () => {
=======
import { useSellerAuthStore } from '@/store/seller/useSellerAuthStore';

export default function SellerHeader() {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const logoutStore = useSellerAuthStore((state) => state.logout); // ✅ 상태 초기화용

  useEffect(() =>{
    const fetchName = async () => {
      try {
        const profile = await getProfile();
        setName(profile.name);

      } catch (err){
        console.error('프로필 정보 가져오기 실패', err);
      }
      }
      fetchName();
  }, []);

  const handleLogout = async () => {
    try {
      // 1) 서비스의 logout() 호출 → refreshToken 쿠키 삭제
      await logout();
      
      // 2) accessToken 삭제
      logoutStore();

      // 3) 로그인 페이지로 리디렉트
      router.push('/seller/login');
    } catch (err) {
      console.error('로그아웃 실패', err);
      // 예외 상황에도 로컬 토큰은 삭제하고 로그인 페이지로 이동
      logoutStore();
      router.push('/seller/login');
    }
  };

>>>>>>> FE/team2/ho:src/components/seller/SellerHeader.tsx
  return (
    <header style={{ background: '#333', color: 'white', padding: '10px 20px' }}>
      <h1>Admin Panel</h1>
    </header>
  );
};

export default Header;
