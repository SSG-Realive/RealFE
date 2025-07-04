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
import { 
    SellerSettlementResponse, 
    PayoutLogDetailResponse,
    DailySettlementItem 
} from '@/types/seller/sellersettlement/sellerSettlement';
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
import { useGlobalDialog } from '@/app/context/dialogContext';

export default function SellerSettlementPage() {
    const checking = useSellerAuthGuard();
    const router = useRouter();
    

    
    // 상태 관리 - 기본값을 전체 조회로 설정
    const [payouts, setPayouts] = useState<SellerSettlementResponse[]>([]);
    const [selectedPayout, setSelectedPayout] = useState<PayoutLogDetailResponse | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'period'>('all');
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
    const [dailyPayouts, setDailyPayouts] = useState<DailySettlementItem[]>([]); // 하루 단위로 재구성된 정산 데이터
    const {show} = useGlobalDialog();
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // 전체 정산 내역 조회
    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await getSellerSettlementList();
            setPayouts(res || []);
            
            // 하루 단위로 재구성
            await createDailyPayoutsFromDetails(res || []);
            setError(null);
        } catch (err) {
            console.error('정산 목록 조회 실패:', err);
            setError('정산 데이터를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };



    // 기간별 필터링
    const fetchFilteredByPeriod = async (from: string, to: string) => {
        try {
            setLoading(true);
            console.log('=== 기간별 필터링 시작 ===');
            console.log('요청 기간:', from, '~', to);
            console.log('API 호출 URL:', `/seller/settlements/by-period?from=${from}&to=${to}`);
            
            const res = await getSellerSettlementListByPeriod(from, to);
            console.log('📊 백엔드 응답 데이터:', res);
            console.log('📊 응답 데이터 개수:', res?.length || 0);
            
            if (res && res.length > 0) {
                console.log('📊 모든 응답 데이터의 기간 정보:');
                res.forEach((item, index) => {
                    console.log(`데이터 ${index + 1}:`, {
                        id: item.id,
                        periodStart: item.periodStart,
                        periodEnd: item.periodEnd,
                        sellerId: item.sellerId,
                        inRange: item.periodStart >= from && item.periodEnd <= to ? '✅' : '❌'
                    });
                });
                
                // 기간 밖의 데이터가 있는지 확인
                const outOfRangeItems = res.filter(item => 
                    item.periodStart < from || item.periodEnd > to
                );
                if (outOfRangeItems.length > 0) {
                    console.warn('⚠️ 기간 밖의 데이터가 백엔드에서 반환됨:', outOfRangeItems);
                }
            } else {
                console.log('⚠️ 기간별 필터링 결과: 데이터가 없습니다.');
            }
            
            setPayouts(res || []);
            
            // 하루 단위로 재구성
            await createDailyPayoutsFromDetails(res || []);
            
            // 요약 정보도 함께 조회
            try {
                const summaryRes = await getSellerSettlementSummary(from, to);
                console.log('요약 정보:', summaryRes);
                setSummary(summaryRes);
            } catch (summaryErr) {
                console.error('요약 정보 조회 실패:', summaryErr);
                setSummary(null);
            }
            
            setError(null);
        } catch (err: any) {
            console.error('기간 필터 조회 실패:', err);
            console.error('에러 상세:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });
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
                errorMessage = '서버에서 오류가 발생했습니다. 백엔드 팀에 문의해주세요.';
            } else if (err.response?.status === 404) {
                errorMessage = '해당 정산 정보를 찾을 수 없습니다.';
            } else if (err.response?.status === 403) {
                errorMessage = '정산 정보에 접근할 권한이 없습니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            
            // 에러 발생 시 알림 표시
            show(errorMessage);
        }
    };

    // 현재 필터 상태에 따른 새로고침
    const applyFilter = () => {
        console.log('새로고침 버튼 클릭 - 현재 필터:', {
            type: filterType,
            from: filterFrom,
            to: filterTo
        });
        
        if (filterType === 'period') {
            if (filterFrom && filterTo) {
                console.log('기간별 새로고침 실행');
                fetchFilteredByPeriod(filterFrom, filterTo);
            } else {
                console.log('기간이 설정되지 않아 전체 조회 실행');
                fetchAll();
            }
        } else {
            console.log('전체 새로고침 실행');
            fetchAll();
        }
    };

    // 필터 초기화
    const resetFilter = () => {
        setFilterType('all');
        setFilterFrom('');
        setFilterTo('');
        setSummary(null);
        fetchAll();
    };

    // 필터 타입 변경 핸들러
    const handleFilterTypeChange = (type: 'all' | 'period') => {
        console.log('필터 타입 변경:', type);
        setFilterType(type);
        
        if (type === 'all') {
            // 전체 조회 즉시 실행
            fetchAll();
        }
        // 기간별은 useEffect에서 자동으로 처리됨
    };

    // 기간 필터 변경 핸들러 - 상태만 업데이트하고 API 호출은 하지 않음
    const handlePeriodChange = (from: string, to: string) => {
        console.log('기간 변경:', { from, to, currentFrom: filterFrom, currentTo: filterTo });
        
        // 상태만 업데이트 (API 호출은 별도로)
        if (from !== undefined) setFilterFrom(from);
        if (to !== undefined) setFilterTo(to);
        
        console.log('기간 상태 업데이트 완료');
    };

    useEffect(() => {
        if (checking) return;
        // 초기 로딩 시 전체 정산 내역 조회
        fetchAll();
    }, [checking]);

    // 기간별 필터 자동 실행
    useEffect(() => {
        if (filterType === 'period' && filterFrom && filterTo) {
            console.log('🔄 기간별 필터 자동 실행:', filterFrom, '~', filterTo);
            fetchFilteredByPeriod(filterFrom, filterTo);
        }
    }, [filterType, filterFrom, filterTo]);

    // 정산 상세 데이터를 날짜별 + 건별로 분리하여 정산 목록 생성
    const createDailyPayoutsFromDetails = async (payoutList: SellerSettlementResponse[]) => {
        try {
            console.log('=== 정산 데이터 가공 시작 ===');
            console.log('입력된 정산 목록:', payoutList);
            
            // 날짜별로 데이터를 그룹핑할 맵
            const dailyDataMap: { [date: string]: DailySettlementItem } = {};
            
            for (const payout of payoutList) {
                console.log(`정산 ID ${payout.id} 처리 중...`, {
                    periodStart: payout.periodStart,
                    periodEnd: payout.periodEnd,
                    totalSales: payout.totalSales
                });
                
                try {
                    // 각 정산의 상세 정보 조회
                    const detail = await getSellerSettlementDetail(payout.id);
                    console.log(`정산 ID ${payout.id} 상세 정보:`, {
                        salesDetailsCount: detail.salesDetails.length,
                        salesDetails: detail.salesDetails.map(sd => ({
                            soldAt: sd.salesLog.soldAt,
                            totalPrice: sd.salesLog.totalPrice,
                            productId: sd.salesLog.productId
                        }))
                    });
                    
                    // 각 salesDetail을 날짜별로 그룹핑
                    detail.salesDetails.forEach((saleDetail, index) => {
                        const saleDate = saleDetail.salesLog.soldAt.split('T')[0]; // YYYY-MM-DD 형식으로 변환
                        console.log(`판매 건 ${index + 1}:`, {
                            saleDate,
                            productId: saleDetail.salesLog.productId,
                            totalPrice: saleDetail.salesLog.totalPrice,
                            soldAt: saleDetail.salesLog.soldAt
                        });
                        
                        // 기간별 필터가 활성화된 경우 클라이언트에서도 한번 더 확인
                        if (filterType === 'period' && filterFrom && filterTo) {
                            if (saleDate < filterFrom || saleDate > filterTo) {
                                console.log(`❌ 판매일 ${saleDate}가 필터 기간 ${filterFrom}~${filterTo} 밖이므로 제외`);
                                return; // 해당 건 제외
                            }
                        }
                        
                        console.log(`✅ 판매 건 ${index + 1} 포함됨:`, saleDate);
                        
                        // 날짜별로 데이터 합산
                        if (!dailyDataMap[saleDate]) {
                            dailyDataMap[saleDate] = {
                                id: `daily_${saleDate}`,
                            originalPayoutId: payout.id,
                            sellerId: payout.sellerId,
                            date: saleDate,
                            periodStart: saleDate,
                            periodEnd: saleDate,
                                totalSales: 0,
                                totalCommission: 0,
                                payoutAmount: 0,
                            processedAt: payout.processedAt,
                                salesCount: 0,
                                salesDetails: [] // 해당 날짜의 모든 상세 내역
                            };
                        }
                        
                        // 날짜별 합계 누적
                        dailyDataMap[saleDate].totalSales += saleDetail.salesLog.totalPrice;
                        dailyDataMap[saleDate].totalCommission += saleDetail.commissionLog.commissionAmount;
                        dailyDataMap[saleDate].payoutAmount += (saleDetail.salesLog.totalPrice - saleDetail.commissionLog.commissionAmount);
                        dailyDataMap[saleDate].salesCount += 1;
                        dailyDataMap[saleDate].salesDetails.push(saleDetail);
                    });
                } catch (detailError) {
                    console.error(`정산 상세 조회 실패 (ID: ${payout.id}):`, detailError);
                    // 상세 조회 실패 시 원본 데이터를 하루 단위로 변환
                    const fallbackDate = payout.periodStart;
                    if (!dailyDataMap[fallbackDate]) {
                        dailyDataMap[fallbackDate] = {
                            id: `daily_${fallbackDate}_fallback`,
                        originalPayoutId: payout.id,
                        sellerId: payout.sellerId,
                            date: fallbackDate,
                            periodStart: fallbackDate,
                        periodEnd: payout.periodEnd,
                        totalSales: payout.totalSales,
                        totalCommission: payout.totalCommission,
                        payoutAmount: payout.payoutAmount,
                        processedAt: payout.processedAt,
                        salesCount: 1,
                        salesDetails: []
                        };
                    }
                }
            }
            
            // 맵을 배열로 변환하고 날짜순 정렬 (최신순)
            const dailyData = Object.values(dailyDataMap).sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
            });
            
            console.log('날짜별로 합산된 정산 데이터:', dailyData);
            setDailyPayouts(dailyData);
            
        } catch (error) {
            console.error('날짜별 합산 정산 데이터 생성 실패:', error);
            setDailyPayouts([]);
        }
    };

    // 통계 계산 (건별로 분리된 결과 사용)
    const totalSettlements = dailyPayouts.length;
    const totalSales = dailyPayouts.reduce((sum, item) => sum + item.totalSales, 0);
    const totalCommission = dailyPayouts.reduce((sum, item) => sum + item.totalCommission, 0);
    const totalPayout = dailyPayouts.reduce((sum, item) => sum + item.payoutAmount, 0);

    // 배송 완료된 주문만 정산 대상 - 즉시 정산 완료 처리
    // 모든 데이터는 이미 배송 완료 후 정산된 상태
    const completedSettlements = dailyPayouts; // 모든 정산이 완료된 상태
    const completedAmount = dailyPayouts.reduce((sum, item) => sum + item.payoutAmount, 0);

    if (checking || loading) {
        return (
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a89f91] mx-auto mb-4"></div>
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
                    <div className="mb-6">
                        <h1 className="text-xl md:text-2xl font-bold text-[#374151]">정산 관리</h1>

                        {filterType === 'period' && filterFrom && filterTo && (
                            <p className="text-sm text-[#6b7280] mt-1">
                                조회 기간: {filterFrom} ~ {filterTo} - 배송 완료된 주문만 즉시 정산
                            </p>
                        )}
                        {filterType === 'all' && (
                            <p className="text-sm text-[#6b7280] mt-1">
                                전체 기간 조회 - 배송 완료된 주문만 즉시 정산
                            </p>
                        )}
                    </div>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <span className="text-[#374151] text-sm font-semibold">정산 건수</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{completedSettlements.length}건</div>
                            <div className="text-sm font-semibold text-green-600">{completedAmount.toLocaleString()}원</div>
                            <div className="text-xs text-[#6b7280] mt-1">배송 완료시 즉시 정산</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-8 h-8 text-[#374151]" />
                                <span className="text-[#374151] text-sm font-semibold">총 정산액</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{summary ? summary.totalPayoutAmount.toLocaleString() : totalPayout.toLocaleString()}원</div>
                            <div className="text-xs text-[#6b7280] mt-1">
                                {filterType === 'period' && `${filterFrom}~${filterTo}`}
                                {filterType === 'all' && '전체 기간'}
                            </div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                                <span className="text-[#374151] text-sm font-semibold">평균 정산액</span>
                    </div>
                            <div className="text-2xl font-bold text-blue-600">
                                {completedSettlements.length > 0 ? Math.round(completedAmount / completedSettlements.length).toLocaleString() : 0}원
                                                    </div>
                            <div className="text-xs text-[#6b7280] mt-1">건당 평균 지급액</div>
                        </section>
                                                    </div>



                    {/* 필터 섹션 */}
                    <div className="bg-[#f3f4f6] p-4 rounded-lg shadow-sm border-2 border-[#d1d5db] mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-[#6b7280]" />
                            <h3 className="text-[#374151] font-semibold">필터 옵션</h3>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">실시간 적용</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            {/* 필터 타입 선택 */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleFilterTypeChange('all')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filterType === 'all' 
                                            ? 'bg-[#d1d5db] text-[#374151] shadow-sm'
                                            : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] hover:text-[#374151]'
                                    }`}
                                >
                                    전체
                                </button>
                                <button
                                    onClick={() => handleFilterTypeChange('period')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filterType === 'period' 
                                            ? 'bg-[#d1d5db] text-[#374151] shadow-sm'
                                            : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] hover:text-[#374151]'
                                    }`}
                                >
                                    기간별
                                </button>
                            </div>

                            {/* 기간별 필터 */}
                            {filterType === 'period' && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#6b7280]" />
                                    <input
                                        type="date"
                                        value={filterFrom}
                                        onChange={(e) => handlePeriodChange(e.target.value, filterTo)}
                                        placeholder="시작일"
                                        className="border border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-[#374151] transition-all"
                                    />
                                    <span className="text-[#374151]">~</span>
                                    <input
                                        type="date"
                                        value={filterTo}
                                        onChange={(e) => handlePeriodChange(filterFrom, e.target.value)}
                                        placeholder="종료일"
                                        className="border border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-[#374151] transition-all"
                            />
                        </div>
                            )}

                            {/* 필터 버튼들 */}
                            <div className="flex gap-2">
                        <button
                                    onClick={applyFilter}
                                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                                    새로고침
                        </button>
                            </div>
                        </div>
                    </div>

                    {/* 정산 리스트 */}
                    {error ? (
                        <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg p-4">
                            <p className="text-[#374151]">{error}</p>
                        </div>
                    ) : dailyPayouts.length === 0 ? (
                        <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg p-8 text-center">
                            <CreditCard className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
                            <p className="text-[#6b7280] text-lg">
                                {filterType === 'period' ? '해당 기간에 판매된 주문의 정산 내역이 없습니다.' : '판매된 주문의 정산 내역이 없습니다.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* 데이터 검증 안내 */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center mt-0.5">i</div>
                                    <div>
                                        <h4 className="font-semibold text-blue-800 mb-1">정산 데이터 안내</h4>
                                        <p className="text-blue-700 text-sm">
                                            각 행은 하루치 판매 합계를 나타내며, "상세 보기"를 클릭하여 해당 날짜의 개별 주문 내역을 확인할 수 있습니다. 
                                            배송 완료된 주문만 즉시 정산 처리됩니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                        <div className="overflow-x-auto bg-[#f3f4f6] rounded-lg shadow-sm border border-[#d1d5db]">
                            <table className="min-w-full divide-y divide-[#d1d5db]">
                                <thead className="bg-[#f3f4f6]">
                                    <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">판매일</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">판매건수</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">총 매출</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">수수료</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">지급액</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상세보기</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                                        {dailyPayouts.map((item) => {
                                            return (
                                                <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-[#374151]">
                                                            <div className="font-semibold">
                                                                {item.date}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#374151] font-semibold">
                                                        {item.salesCount}건
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#374151] font-semibold">
                                                {item.totalSales.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#374151]">
                                                {item.totalCommission.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#374151]">
                                                {item.payoutAmount.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                            onClick={() => {
                                                                // 해당 날짜의 상세 데이터를 모달에 표시
                                                                const mockDetail = {
                                                                    payoutInfo: {
                                                                        id: item.originalPayoutId,
                                                                        sellerId: item.sellerId,
                                                                        periodStart: item.date,
                                                                        periodEnd: item.date,
                                                                        totalSales: item.totalSales,
                                                                        totalCommission: item.totalCommission,
                                                                        payoutAmount: item.payoutAmount,
                                                                        processedAt: item.processedAt
                                                                    },
                                                                    salesDetails: item.salesDetails || []
                                                                };
                                                                setSelectedPayout(mockDetail);
                                                            }}
                                                    className="inline-flex items-center gap-1 bg-[#d1d5db] text-[#374151] px-3 py-1.5 rounded hover:bg-[#e5e7eb] hover:text-[#374151] text-sm transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> 상세 보기
                                                </button>
                                            </td>
                                        </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}

                    {/* 정산 상세 정보 모달 */}
                    {selectedPayout && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-[#f3f4f6] rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto border-2 border-[#d1d5db]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-[#374151]">
                                        {selectedPayout.payoutInfo.periodStart} 날짜별 정산 상세 내역
                                    </h3>
                                    <button
                                        onClick={() => setSelectedPayout(null)}
                                        className="text-[#374151] hover:text-[#b94a48]"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                {/* 실제 계산된 정산 정보 */}
                                {(() => {
                                    // salesDetails를 기반으로 실제 총합 계산
                                    const calculatedTotalSales = selectedPayout.salesDetails.reduce(
                                        (sum, detail) => sum + detail.salesLog.totalPrice, 0
                                    );
                                    const calculatedTotalCommission = selectedPayout.salesDetails.reduce(
                                        (sum, detail) => sum + detail.commissionLog.commissionAmount, 0
                                    );
                                    const calculatedPayoutAmount = calculatedTotalSales - calculatedTotalCommission;
                                    
                                    // 백엔드 값과 계산된 값 비교
                                    const salesDiff = selectedPayout.payoutInfo.totalSales - calculatedTotalSales;
                                    const commissionDiff = selectedPayout.payoutInfo.totalCommission - calculatedTotalCommission;
                                    const payoutDiff = selectedPayout.payoutInfo.payoutAmount - calculatedPayoutAmount;
                                    
                                    // 차이가 있으면 로그 출력
                                    if (salesDiff !== 0 || commissionDiff !== 0 || payoutDiff !== 0) {
                                        console.log('=== 정산 데이터 불일치 발견 ===');
                                        console.log('백엔드 총매출:', selectedPayout.payoutInfo.totalSales.toLocaleString());
                                        console.log('계산된 총매출:', calculatedTotalSales.toLocaleString());
                                        console.log('매출 차이:', salesDiff.toLocaleString());
                                        console.log('백엔드 총수수료:', selectedPayout.payoutInfo.totalCommission.toLocaleString());
                                        console.log('계산된 총수수료:', calculatedTotalCommission.toLocaleString());
                                        console.log('수수료 차이:', commissionDiff.toLocaleString());
                                        console.log('백엔드 지급액:', selectedPayout.payoutInfo.payoutAmount.toLocaleString());
                                        console.log('계산된 지급액:', calculatedPayoutAmount.toLocaleString());
                                        console.log('지급액 차이:', payoutDiff.toLocaleString());
                                        console.log('판매 상세 내역 개수:', selectedPayout.salesDetails.length);
                                    }
                                    
                                    return (
                                        <>
                                            {/* 차이가 있을 경우 경고 표시 */}
                                            {(salesDiff !== 0 || commissionDiff !== 0 || payoutDiff !== 0) && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 bg-yellow-400 rounded-full text-white text-xs flex items-center justify-center">!</div>
                                                        <h4 className="font-semibold text-yellow-800">데이터 불일치 감지</h4>
                                                    </div>
                                                    <p className="text-yellow-700 text-sm">
                                                        정산 총계와 상세 내역의 합계가 일치하지 않습니다. 개발자 도구 콘솔을 확인해주세요.
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* 정산 기본 정보 - 계산된 값 사용 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-lg border border-[#d1d5db]">
                                        <h4 className="font-semibold text-[#374151] mb-2">정산 기간</h4>
                                        <p className="text-[#374151]">
                                            {selectedPayout.payoutInfo.periodStart} ~ {selectedPayout.payoutInfo.periodEnd}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-[#d1d5db]">
                                                    <h4 className="font-semibold text-[#374151] mb-2">
                                                        총 매출
                                                        {salesDiff !== 0 && (
                                                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                                재계산됨
                                                            </span>
                                                        )}
                                                    </h4>
                                        <p className="text-[#388e3c] font-bold">
                                                        {calculatedTotalSales.toLocaleString()}원
                                                    </p>
                                                    {salesDiff !== 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            원래: {selectedPayout.payoutInfo.totalSales.toLocaleString()}원
                                                        </p>
                                                    )}
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-[#d1d5db]">
                                                    <h4 className="font-semibold text-[#374151] mb-2">
                                                        수수료
                                                        {commissionDiff !== 0 && (
                                                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                                재계산됨
                                                            </span>
                                                        )}
                                                    </h4>
                                        <p className="text-[#374151] font-bold">
                                                        {calculatedTotalCommission.toLocaleString()}원
                                                    </p>
                                                    {commissionDiff !== 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            원래: {selectedPayout.payoutInfo.totalCommission.toLocaleString()}원
                                                        </p>
                                                    )}
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-[#d1d5db]">
                                                    <h4 className="font-semibold text-[#374151] mb-2">
                                                        지급액
                                                        {payoutDiff !== 0 && (
                                                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                                재계산됨
                                                            </span>
                                                        )}
                                                    </h4>
                                        <p className="text-[#6b7280] font-bold">
                                                        {calculatedPayoutAmount.toLocaleString()}원
                                                    </p>
                                                    {payoutDiff !== 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            원래: {selectedPayout.payoutInfo.payoutAmount.toLocaleString()}원
                                                        </p>
                                                    )}
                                    </div>
                                </div>
                                        </>
                                    );
                                })()}

                                {/* 판매 상세 내역 */}
                                <div className="bg-white rounded-lg p-4 border border-[#d1d5db]">
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
