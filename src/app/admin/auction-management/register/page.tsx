"use client";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function AuctionRegisterPage() {
  const router = useRouter();

  if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
    window.location.replace('/admin/login');
    return null;
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4">경매 물품 등록</h2>
      <form className="space-y-2">
        <input className="border px-2 py-1 w-full" placeholder="상품명" />
        <input className="border px-2 py-1 w-full" placeholder="시작가" type="number" />
        <textarea className="border px-2 py-1 w-full" placeholder="상품 설명" rows={3} />
        <input className="border px-2 py-1 w-full" type="file" accept="image/*" />
        <input className="border px-2 py-1 w-full" placeholder="시작일" type="date" />
        <input className="border px-2 py-1 w-full" placeholder="종료일" type="date" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="button">등록</button>
      </form>
    </div>
  );
} 