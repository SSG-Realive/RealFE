// src/app/components/Header.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProfile, logout } from '@/service/sellerService';
import { useEffect, useState } from 'react';
import React from 'react';

const Header = () => {
  return (
    <header style={{ background: '#333', color: 'white', padding: '10px 20px' }}>
      <h1>Admin Panel</h1>
    </header>
  );
};

export default Header;
