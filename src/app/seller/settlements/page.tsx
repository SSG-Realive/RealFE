'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SellerLayout from '@/components/layouts/SellerLayout';
import SellerHeader from '@/components/seller/SellerHeader';
import {
    getSellerSettlementList,
    getSellerSettlementListByDate,
} from '@/service/seller/sellerSettlementService';
import { SellerSettlementResponse } from '@/types/seller/sellersettlement/sellerSettlement';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { DollarSign, TrendingUp, Percent, CreditCard, Calendar, Search, RefreshCw } from 'lucide-react';

export default function SellerSettlementPage() {
    const checking = useSellerAuthGuard();

    const router = useRouter();
    const [payouts, setPayouts] = useState<SellerSettlementResponse[]>([]);
    const [filterDate, setFilterDate] = useState(''); // ✅ 날짜 필터 상태
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await getSellerSettlementList();
            setPayouts(res || []);
            setError(null);
        } catch (err) {
            console.error('정산 목록 조회 실패:', err);
            setError('정산 데이터를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFiltered = async (date: string) => {
        try {
            setLoading(true);
            const res = await getSellerSettlementListByDate(date);
            setPayouts(res || []);
            setError(null);
        } catch (err) {
            console.error('날짜 필터 조회 실패:', err);
            setError('해당 날짜의 정산 데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (checking) return;
        fetchAll(); // 초기 전체 조회
    }, [checking]);

    // 통계 계산
    const totalSettlements = payouts.length;
    const totalSales = payouts.reduce((sum, item) => sum + item.totalSales, 0);
    const totalCommission = payouts.reduce((sum, item) => sum + item.totalCommission, 0);
    const totalPayout = payouts.reduce((sum, item) => sum + item.payoutAmount, 0);

    if (checking || loading) {
        return (
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">정산 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="hidden">
                <SellerHeader toggleSidebar={toggleSidebar} />
            </div>
            <SellerLayout>
                <div className="flex-1 w-full h-full px-4 py-8 bg-gray-100">
                    <h1 className="text-xl md:text-2xl font-bold mb-6">정산 관리</h1>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">총 정산 건수</h2>
                                <p className="text-xl md:text-2xl font-bold text-gray-800">{totalSettlements}건</p>
                            </div>
                            <CreditCard className="w-8 h-8 text-blue-500" />
                        </section>
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">총 매출</h2>
                                <p className="text-xl md:text-2xl font-bold text-green-600">{totalSales.toLocaleString()}원</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </section>
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">총 수수료</h2>
                                <p className="text-xl md:text-2xl font-bold text-red-600">{totalCommission.toLocaleString()}원</p>
                            </div>
                            <Percent className="w-8 h-8 text-red-500" />
                        </section>
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">총 지급액</h2>
                                <p className="text-xl md:text-2xl font-bold text-blue-600">{totalPayout.toLocaleString()}원</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-500" />
                        </section>
                    </div>

                    {/* 날짜 필터 */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-center">
                        <div className="flex items-center gap-2 flex-1">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                        <button
                            onClick={() => fetchFiltered(filterDate)}
                            disabled={!filterDate}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Search className="w-4 h-4" />
                            날짜 필터
                        </button>
                        <button
                            onClick={() => {
                                setFilterDate('');
                                fetchAll();
                            }}
                            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            <RefreshCw className="w-4 h-4" />
                            전체 보기
                        </button>
                    </div>

                    {/* 정산 리스트 */}
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">정산 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정산 기간</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 매출</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수수료</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지급액</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">처리일시</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {payouts.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                                                {item.periodStart} ~ {item.periodEnd}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                                {item.totalSales.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-red-600">
                                                {item.totalCommission.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                                                {item.payoutAmount.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {item.processedAt}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </>
    );
}
