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

export default function SellerSettlementPage() {
    useSellerAuthGuard();

    const router = useRouter();
    const [payouts, setPayouts] = useState<SellerSettlementResponse[]>([]);
    const [filterDate, setFilterDate] = useState(''); // ✅ 날짜 필터 상태
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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

        fetchAll(); // 초기 전체 조회
    }, []);

    return (
        <>
            <SellerHeader />
            <SellerLayout>
                <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gray-50 px-4 md:px-8 py-6">
                    <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">판매자 정산 내역</h1>

                    {/* ✅ 날짜 필터 */}
                    <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center gap-3">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchFiltered(filterDate)}
                                disabled={!filterDate}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                날짜 필터 조회
                            </button>
                            <button
                                onClick={() => {
                                    setFilterDate('');
                                    fetchAll();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                                전체 보기
                            </button>
                        </div>
                    </div>

                    {/* ✅ 테이블  변경 사항이 있습니다*/}
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">로딩 중...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-gray-700">정산 기간</th>
                                        <th className="px-4 py-3 font-medium text-gray-700">총 매출</th>
                                        <th className="px-4 py-3 font-medium text-gray-700">수수료</th>
                                        <th className="px-4 py-3 font-medium text-gray-700">지급액</th>
                                        <th className="px-4 py-3 font-medium text-gray-700">처리일시</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {payouts.length > 0 ? (
                                        payouts.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-gray-900">
                                                    {item.periodStart} ~ {item.periodEnd}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900">{item.totalSales.toLocaleString()}원</td>
                                                <td className="px-4 py-3 text-gray-900">{item.totalCommission.toLocaleString()}원</td>
                                                <td className="px-4 py-3 font-semibold text-green-600">
                                                    {item.payoutAmount.toLocaleString()}원
                                                </td>
                                                <td className="px-4 py-3 text-gray-900">{item.processedAt}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center text-gray-500 py-8">
                                                정산 내역이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </>
    );
}
