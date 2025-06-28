'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SellerLayout from '@/components/layouts/SellerLayout';
import SellerHeader from '@/components/seller/SellerHeader';
import {
    getSellerSettlementList,
    getSellerSettlementListByDate,
    getSellerSettlementListByPeriod,
    getSellerSettlementSummary,
    getSellerSettlementDetail,
} from '@/service/seller/sellerSettlementService';
import { SellerSettlementResponse, PayoutLogDetailResponse } from '@/types/seller/sellersettlement/sellerSettlement';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { 
    DollarSign, 
    TrendingUp, 
    Percent, 
    CreditCard, 
    Calendar, 
    Search, 
    RefreshCw, 
    Eye,
    Filter,
    BarChart3
} from 'lucide-react';

export default function SellerSettlementPage() {
    const checking = useSellerAuthGuard();
    const router = useRouter();
    
    // 상태 관리
    const [payouts, setPayouts] = useState<SellerSettlementResponse[]>([]);
    const [selectedPayout, setSelectedPayout] = useState<PayoutLogDetailResponse | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'date' | 'period'>('all');
    const [filterDate, setFilterDate] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [summary, setSummary] = useState<{
        totalPayoutAmount: number;
        totalCommission: number;
        totalSales: number;
        payoutCount: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // 전체 정산 내역 조회
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

    // 날짜별 필터링
    const fetchFilteredByDate = async (date: string) => {
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

    // 기간별 필터링
    const fetchFilteredByPeriod = async (from: string, to: string) => {
        try {
            setLoading(true);
            const res = await getSellerSettlementListByPeriod(from, to);
            setPayouts(res || []);
            
            // 요약 정보도 함께 조회
            const summaryRes = await getSellerSettlementSummary(from, to);
            setSummary(summaryRes);
            setError(null);
        } catch (err) {
            console.error('기간 필터 조회 실패:', err);
            setError('해당 기간의 정산 데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 정산 상세 정보 조회
    const fetchPayoutDetail = async (payoutLogId: number) => {
        try {
            const res = await getSellerSettlementDetail(payoutLogId);
            setSelectedPayout(res);
        } catch (err) {
            console.error('정산 상세 조회 실패:', err);
            setError('정산 상세 정보를 불러오지 못했습니다.');
        }
    };

    // 필터 적용
    const applyFilter = () => {
        if (filterType === 'date' && filterDate) {
            fetchFilteredByDate(filterDate);
        } else if (filterType === 'period' && filterFrom && filterTo) {
            fetchFilteredByPeriod(filterFrom, filterTo);
        } else {
            fetchAll();
        }
    };

    // 필터 초기화
    const resetFilter = () => {
        setFilterType('all');
        setFilterDate('');
        setFilterFrom('');
        setFilterTo('');
        setSummary(null);
        fetchAll();
    };

    useEffect(() => {
        if (checking) return;
        fetchAll();
    }, [checking]);

    // 통계 계산 (전체 또는 필터된 결과)
    const totalSettlements = payouts.length;
    const totalSales = payouts.reduce((sum, item) => sum + item.totalSales, 0);
    const totalCommission = payouts.reduce((sum, item) => sum + item.totalCommission, 0);
    const totalPayout = payouts.reduce((sum, item) => sum + item.payoutAmount, 0);

    if (checking || loading) {
        return (
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-[#a89f91] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bfa06a] mx-auto mb-4"></div>
                    <p className="text-[#5b4636]">정산 정보를 불러오는 중...</p>
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
                <div className="flex-1 w-full h-full px-4 py-8">
                    <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#5b4636]">정산 관리</h1>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                        <section className="bg-[#e3f6f5] p-4 md:p-6 rounded-lg shadow-sm border border-[#bfa06a] flex items-center justify-between">
                            <div>
                                <h2 className="text-[#5b4636] text-sm font-semibold mb-2">총 정산 건수</h2>
                                <p className="text-xl md:text-2xl font-bold text-[#5b4636]">
                                    {summary ? summary.payoutCount : totalSettlements}건
                                </p>
                            </div>
                            <CreditCard className="w-8 h-8 text-[#bfa06a]" />
                        </section>
                        <section className="bg-[#e3f6f5] p-4 md:p-6 rounded-lg shadow-sm border border-[#bfa06a] flex items-center justify-between">
                            <div>
                                <h2 className="text-[#5b4636] text-sm font-semibold mb-2">총 매출</h2>
                                <p className="text-xl md:text-2xl font-bold text-[#388e3c]">
                                    {(summary ? summary.totalSales : totalSales).toLocaleString()}원
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-[#bfa06a]" />
                        </section>
                        <section className="bg-[#e3f6f5] p-4 md:p-6 rounded-lg shadow-sm border border-[#bfa06a] flex items-center justify-between">
                            <div>
                                <h2 className="text-[#5b4636] text-sm font-semibold mb-2">총 수수료</h2>
                                <p className="text-xl md:text-2xl font-bold text-[#b94a48]">
                                    {(summary ? summary.totalCommission : totalCommission).toLocaleString()}원
                                </p>
                            </div>
                            <Percent className="w-8 h-8 text-[#bfa06a]" />
                        </section>
                        <section className="bg-[#e3f6f5] p-4 md:p-6 rounded-lg shadow-sm border border-[#bfa06a] flex items-center justify-between">
                            <div>
                                <h2 className="text-[#5b4636] text-sm font-semibold mb-2">총 지급액</h2>
                                <p className="text-xl md:text-2xl font-bold text-[#bfa06a]">
                                    {(summary ? summary.totalPayoutAmount : totalPayout).toLocaleString()}원
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-[#bfa06a]" />
                        </section>
                    </div>

                    {/* 필터 섹션 */}
                    <div className="bg-[#e3f6f5] p-4 rounded-lg shadow-sm border border-[#bfa06a] mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-[#bfa06a]" />
                            <h3 className="text-[#5b4636] font-semibold">필터 옵션</h3>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            {/* 필터 타입 선택 */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        filterType === 'all' 
                                            ? 'bg-[#bfa06a] text-[#4b3a2f]' 
                                            : 'bg-[#5b4636] text-[#e3f6f5] hover:bg-[#bfa06a] hover:text-[#4b3a2f]'
                                    }`}
                                >
                                    전체
                                </button>
                                <button
                                    onClick={() => setFilterType('date')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        filterType === 'date' 
                                            ? 'bg-[#bfa06a] text-[#4b3a2f]' 
                                            : 'bg-[#5b4636] text-[#e3f6f5] hover:bg-[#bfa06a] hover:text-[#4b3a2f]'
                                    }`}
                                >
                                    날짜별
                                </button>
                                <button
                                    onClick={() => setFilterType('period')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        filterType === 'period' 
                                            ? 'bg-[#bfa06a] text-[#4b3a2f]' 
                                            : 'bg-[#5b4636] text-[#e3f6f5] hover:bg-[#bfa06a] hover:text-[#4b3a2f]'
                                    }`}
                                >
                                    기간별
                                </button>
                            </div>

                            {/* 날짜별 필터 */}
                            {filterType === 'date' && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#bfa06a]" />
                                    <input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="border border-[#bfa06a] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa06a] bg-white text-[#5b4636]"
                                    />
                                </div>
                            )}

                            {/* 기간별 필터 */}
                            {filterType === 'period' && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#bfa06a]" />
                                    <input
                                        type="date"
                                        value={filterFrom}
                                        onChange={(e) => setFilterFrom(e.target.value)}
                                        placeholder="시작일"
                                        className="border border-[#bfa06a] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa06a] bg-white text-[#5b4636]"
                                    />
                                    <span className="text-[#5b4636]">~</span>
                                    <input
                                        type="date"
                                        value={filterTo}
                                        onChange={(e) => setFilterTo(e.target.value)}
                                        placeholder="종료일"
                                        className="border border-[#bfa06a] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa06a] bg-white text-[#5b4636]"
                                    />
                                </div>
                            )}

                            {/* 필터 버튼들 */}
                            <div className="flex gap-2">
                                <button
                                    onClick={applyFilter}
                                    disabled={filterType === 'date' && !filterDate || filterType === 'period' && (!filterFrom || !filterTo)}
                                    className="flex items-center gap-2 bg-[#bfa06a] text-[#4b3a2f] px-4 py-2 rounded-md hover:bg-[#5b4636] hover:text-[#e9dec7] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Search className="w-4 h-4" />
                                    조회
                                </button>
                                <button
                                    onClick={resetFilter}
                                    className="flex items-center gap-2 bg-[#5b4636] text-[#e9dec7] px-4 py-2 rounded-md hover:bg-[#bfa06a] hover:text-[#4b3a2f]"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 정산 리스트 */}
                    {error ? (
                        <div className="bg-[#fbeee0] border border-[#bfa06a] rounded-lg p-4">
                            <p className="text-[#b94a48]">{error}</p>
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="bg-[#e3f6f5] border border-[#bfa06a] rounded-lg p-8 text-center">
                            <CreditCard className="w-12 h-12 text-[#bfa06a] mx-auto mb-4" />
                            <p className="text-[#bfa06a] text-lg">정산 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#e3f6f5] rounded-lg shadow-sm border border-[#bfa06a]">
                            <table className="min-w-full divide-y divide-[#bfa06a]">
                                <thead className="bg-[#e3f6f5]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">정산 기간</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">총 매출</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">수수료</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">지급액</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">처리일시</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">상세보기</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#e3f6f5] divide-y divide-[#bfa06a]">
                                    {payouts.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#bfa06a] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-[#5b4636]">
                                                {item.periodStart} ~ {item.periodEnd}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#5b4636]">
                                                {item.totalSales.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#b94a48]">
                                                {item.totalCommission.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#388e3c]">
                                                {item.payoutAmount.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5b4636]">
                                                {item.processedAt}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => fetchPayoutDetail(item.id)}
                                                    className="flex items-center gap-1 bg-[#5b4636] text-[#e9dec7] px-3 py-1 rounded-md hover:bg-[#bfa06a] hover:text-[#4b3a2f] text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    상세
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 정산 상세 정보 모달 */}
                    {selectedPayout && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-[#e3f6f5] rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-[#5b4636]">정산 상세 정보</h3>
                                    <button
                                        onClick={() => setSelectedPayout(null)}
                                        className="text-[#5b4636] hover:text-[#b94a48]"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                {/* 정산 기본 정보 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#5b4636] mb-2">정산 기간</h4>
                                        <p className="text-[#5b4636]">
                                            {selectedPayout.payoutInfo.periodStart} ~ {selectedPayout.payoutInfo.periodEnd}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#5b4636] mb-2">총 매출</h4>
                                        <p className="text-[#388e3c] font-bold">
                                            {selectedPayout.payoutInfo.totalSales.toLocaleString()}원
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#5b4636] mb-2">수수료</h4>
                                        <p className="text-[#b94a48] font-bold">
                                            {selectedPayout.payoutInfo.totalCommission.toLocaleString()}원
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#5b4636] mb-2">지급액</h4>
                                        <p className="text-[#bfa06a] font-bold">
                                            {selectedPayout.payoutInfo.payoutAmount.toLocaleString()}원
                                        </p>
                                    </div>
                                </div>

                                {/* 판매 상세 내역 */}
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-[#5b4636] mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        판매 상세 내역 ({selectedPayout.salesDetails.length}건)
                                    </h4>
                                    
                                    {selectedPayout.salesDetails.length === 0 ? (
                                        <p className="text-[#5b4636] text-center py-4">판매 내역이 없습니다.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#5b4636]">상품ID</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#5b4636]">고객ID</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#5b4636]">수량</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#5b4636]">단가</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#5b4636]">총액</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#5b4636]">수수료</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#5b4636]">판매일</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedPayout.salesDetails.map((detail, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 text-sm text-[#5b4636]">
                                                                {detail.salesLog.productId}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#5b4636]">
                                                                {detail.salesLog.customerId}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#5b4636]">
                                                                {detail.salesLog.quantity}개
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#5b4636]">
                                                                {detail.salesLog.unitPrice.toLocaleString()}원
                                                            </td>
                                                            <td className="px-4 py-2 text-sm font-semibold text-[#388e3c]">
                                                                {detail.salesLog.totalPrice.toLocaleString()}원
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#b94a48]">
                                                                {detail.commissionLog.commissionAmount.toLocaleString()}원
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#5b4636]">
                                                                {detail.salesLog.soldAt}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </>
    );
}
