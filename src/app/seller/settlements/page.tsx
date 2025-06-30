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
    BarChart3,
    Clock,
    CheckCircle,
    Calculator
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
            console.log('정산 상세 조회 시도:', payoutLogId);
            const res = await getSellerSettlementDetail(payoutLogId);
            console.log('정산 상세 조회 성공:', res);
            setSelectedPayout(res);
        } catch (err: any) {
            console.error('정산 상세 조회 실패:', err);
            console.error('에러 상세:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data
            });
            
            let errorMessage = '정산 상세 정보를 불러오지 못했습니다.';
            
            if (err.response?.status === 500) {
                errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (err.response?.status === 404) {
                errorMessage = '해당 정산 정보를 찾을 수 없습니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            
            // 에러 발생 시 알림 표시
            alert(errorMessage);
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
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-[#e3f6f5] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4fd1c7] mx-auto mb-4"></div>
                    <p className="text-[#0f766e]">정산 정보를 불러오는 중...</p>
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
                    <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#0f766e]">정산 관리</h1>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">총 매출</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{summary ? summary.totalSales.toLocaleString() : totalSales.toLocaleString()}원</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">정산 대기</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{summary ? summary.payoutCount : totalSettlements}건</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">정산 완료</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{summary ? summary.totalPayoutAmount.toLocaleString() : totalPayout.toLocaleString()}원</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Calculator className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">수수료</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{summary ? summary.totalCommission.toLocaleString() : totalCommission.toLocaleString()}원</div>
                        </section>
                    </div>

                    {/* 필터 섹션 */}
                    <div className="bg-[#f3f4f6] p-4 rounded-lg shadow-sm border-2 border-[#d1d5db] mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-[#6b7280]" />
                            <h3 className="text-[#374151] font-semibold">필터 옵션</h3>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            {/* 필터 타입 선택 */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        filterType === 'all' 
                                            ? 'bg-[#d1d5db] text-[#374151]'
                                            : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] hover:text-[#374151]'
                                    }`}
                                >
                                    전체
                                </button>
                                <button
                                    onClick={() => setFilterType('date')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        filterType === 'date' 
                                            ? 'bg-[#d1d5db] text-[#374151]'
                                            : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] hover:text-[#374151]'
                                    }`}
                                >
                                    날짜별
                                </button>
                                <button
                                    onClick={() => setFilterType('period')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        filterType === 'period' 
                                            ? 'bg-[#d1d5db] text-[#374151]'
                                            : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] hover:text-[#374151]'
                                    }`}
                                >
                                    기간별
                                </button>
                            </div>

                            {/* 날짜별 필터 */}
                            {filterType === 'date' && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#6b7280]" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                        className="border border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4fd1c7] bg-white text-[#374151]"
                                    />
                                </div>
                            )}

                            {/* 기간별 필터 */}
                            {filterType === 'period' && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#6b7280]" />
                                    <input
                                        type="date"
                                        value={filterFrom}
                                        onChange={(e) => setFilterFrom(e.target.value)}
                                        placeholder="시작일"
                                        className="border border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4fd1c7] bg-white text-[#374151]"
                                    />
                                    <span className="text-[#374151]">~</span>
                                    <input
                                        type="date"
                                        value={filterTo}
                                        onChange={(e) => setFilterTo(e.target.value)}
                                        placeholder="종료일"
                                        className="border border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4fd1c7] bg-white text-[#374151]"
                            />
                        </div>
                            )}

                            {/* 필터 버튼들 */}
                            <div className="flex gap-2">
                        <button
                                    onClick={applyFilter}
                                    disabled={filterType === 'date' && !filterDate || filterType === 'period' && (!filterFrom || !filterTo)}
                                    className="flex items-center gap-2 bg-[#d1d5db] text-[#374151] px-4 py-2 rounded-md hover:bg-[#e5e7eb] hover:text-[#374151] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Search className="w-4 h-4" />
                                    조회
                        </button>
                        <button
                                    onClick={resetFilter}
                                    className="flex items-center gap-2 bg-[#d1d5db] text-[#374151] px-4 py-2 rounded-md hover:bg-[#e5e7eb] hover:text-[#374151]"
                        >
                            <RefreshCw className="w-4 h-4" />
                                    초기화
                        </button>
                            </div>
                        </div>
                    </div>

                    {/* 정산 리스트 */}
                    {error ? (
                        <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg p-4">
                            <p className="text-[#374151]">{error}</p>
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg p-8 text-center">
                            <CreditCard className="w-12 h-12 text-[#d1d5db] mx-auto mb-4" />
                            <p className="text-[#d1d5db] text-lg">정산 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#f3f4f6] rounded-lg shadow-sm border border-[#d1d5db]">
                            <table className="min-w-full divide-y divide-[#d1d5db]">
                                <thead className="bg-[#f3f4f6]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">정산 기간</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">총 매출</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">수수료</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">지급액</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">처리일시</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">상세보기</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                                    {payouts.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#e5e7eb] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-[#374151]">
                                                {item.periodStart} ~ {item.periodEnd}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#374151]">
                                                {item.totalSales.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#374151]">
                                                {item.totalCommission.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#374151]">
                                                {item.payoutAmount.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                                                {item.processedAt}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => fetchPayoutDetail(item.id)}
                                                    className="inline-flex items-center gap-1 bg-[#d1d5db] text-[#374151] px-3 py-1.5 rounded hover:bg-[#e5e7eb] hover:text-[#374151] text-sm transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> 상세 보기
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
                            <div className="bg-[#f3f4f6] rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-[#374151]">정산 상세 정보</h3>
                                    <button
                                        onClick={() => setSelectedPayout(null)}
                                        className="text-[#374151] hover:text-[#b94a48]"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                {/* 정산 기본 정보 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#374151] mb-2">정산 기간</h4>
                                        <p className="text-[#374151]">
                                            {selectedPayout.payoutInfo.periodStart} ~ {selectedPayout.payoutInfo.periodEnd}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#374151] mb-2">총 매출</h4>
                                        <p className="text-[#388e3c] font-bold">
                                            {selectedPayout.payoutInfo.totalSales.toLocaleString()}원
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#374151] mb-2">수수료</h4>
                                        <p className="text-[#374151] font-bold">
                                            {selectedPayout.payoutInfo.totalCommission.toLocaleString()}원
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-[#374151] mb-2">지급액</h4>
                                        <p className="text-[#4fd1c7] font-bold">
                                            {selectedPayout.payoutInfo.payoutAmount.toLocaleString()}원
                                        </p>
                                    </div>
                                </div>

                                {/* 판매 상세 내역 */}
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        판매 상세 내역 ({selectedPayout.salesDetails.length}건)
                                    </h4>
                                    
                                    {selectedPayout.salesDetails.length === 0 ? (
                                        <p className="text-[#374151] text-center py-4">판매 내역이 없습니다.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#374151]">상품ID</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#374151]">고객ID</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#374151]">수량</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#374151]">단가</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#374151]">총액</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#374151]">수수료</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-[#374151]">판매일</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedPayout.salesDetails.map((detail, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 text-sm text-[#374151]">
                                                                {detail.salesLog.productId}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#374151]">
                                                                {detail.salesLog.customerId}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#374151]">
                                                                {detail.salesLog.quantity}개
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#374151]">
                                                                {detail.salesLog.unitPrice.toLocaleString()}원
                                                            </td>
                                                            <td className="px-4 py-2 text-sm font-semibold text-[#388e3c]">
                                                                {detail.salesLog.totalPrice.toLocaleString()}원
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#374151]">
                                                                {detail.commissionLog.commissionAmount.toLocaleString()}원
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-[#374151]">
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
