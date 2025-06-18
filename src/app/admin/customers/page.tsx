'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import apiClient from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Customer {
  id: number;
  name: string;
  email: string;
  status: boolean | string;
  image?: string;
}

interface Penalty {
  id: number;
  name: string;
  reason: string;
  date: string;
}

export default function AdminCustomersDashboard() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      window.location.replace('/admin/login');
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      userType: 'CUSTOMER',
      page: '0',
      size: '100',
    });
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
    apiClient.get(`/admin/users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        setCustomers(res.data.data.content || []);
        setLoading(false);
        const customerCount = res.data.data.totalElements || (res.data.data.content?.length ?? 0);
        // 판매자 목록도 불러와서 합산
        apiClient.get(`/admin/users?userType=SELLER&page=0&size=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        .then(res2 => {
          const sellerCount = res2.data.data.totalElements || (res2.data.data.content?.length ?? 0);
          setTotalMembers(customerCount + sellerCount);
        })
        .catch(() => setTotalMembers(customerCount));
      })
      .catch(() => {
        setLoading(false);
        setTotalMembers(0);
      });

    // 패널티 목록 불러오기
    apiClient.get('/admin/penalties?userType=CUSTOMER&page=0&size=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        setPenalties(res.data.data.content || []);
      })
      .catch(() => setPenalties([]));
  }, []);

  // 고객 요약
  // const total = customers.length;
  const active = customers.filter(c => c.status === true || c.status === 'Active').length;
  const blocked = customers.filter(c => c.status === false || c.status === 'Blocked').length;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">회원 대시보드</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-bold mb-2">전체 회원</h3>
          <div className="text-3xl font-bold">{totalMembers}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-bold mb-2">활성 회원</h3>
          <div className="text-3xl font-bold">{active}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-bold mb-2">차단 회원</h3>
          <div className="text-3xl font-bold">{blocked}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 고객 관리 요약 - 테이블형 */}
        <div className="bg-white rounded shadow p-6 min-w-[280px] max-w-full">
          <h2 className="text-lg font-bold mb-4">고객 관리</h2>
          {loading ? (
            <div>로딩 중...</div>
          ) : (
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">이름</th>
                  <th className="px-2 py-1">이메일</th>
                  <th className="px-2 py-1">상태</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td className="px-2 py-1">{c.name}</td>
                    <td className="px-2 py-1">{c.email}</td>
                    <td className="px-2 py-1">{c.status === true || c.status === 'Active' ? 'Active' : 'Blocked'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* 사용자 패널티 요약 - 테이블형 (API 연동) */}
        <div className="bg-white rounded shadow p-6 min-w-[280px] max-w-full">
          <h2 className="text-lg font-bold mb-4">사용자 패널티</h2>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1">이름</th>
                <th className="px-2 py-1">사유</th>
                <th className="px-2 py-1">일자</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map(p => (
                <tr key={p.id}>
                  <td className="px-2 py-1">{p.name}</td>
                  <td className="px-2 py-1">{p.reason}</td>
                  <td className="px-2 py-1">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 