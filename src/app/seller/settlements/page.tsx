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

export default function SellerSettlementPage() {
    const checking = useSellerAuthGuard();
    const router = useRouter();
    
    // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오는 함수
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // 상태 관리 - 기본값을 하루 단위(오늘 날짜)로 설정
    const [payouts, setPayouts] = useState<SellerSettlementResponse[]>([]);
    const [selectedPayout, setSelectedPayout] = useState<PayoutLogDetailResponse | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'date' | 'period'>('date');
    const [filterDate, setFilterDate] = useState(getTodayDate());
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

    // 날짜별 필터링
    const fetchFilteredByDate = async (date: string) => {
        try {
            setLoading(true);
            const res = await getSellerSettlementListByDate(date);
            setPayouts(res || []);
            
            // 하루 단위로 재구성
            await createDailyPayoutsFromDetails(res || []);
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
            console.log('=== 기간별 필터링 시작 ===');
            console.log('요청 기간:', from, '~', to);
            
            const res = await getSellerSettlementListByPeriod(from, to);
            console.log('백엔드 응답 데이터:', res);
            console.log('응답 데이터 개수:', res?.length || 0);
            
            if (res && res.length > 0) {
                console.log('첫 번째 데이터 샘플:', res[0]);
                res.forEach((item, index) => {
                    if (index < 5) { // 처음 5개만 로그 출력
                        console.log(`데이터 ${index + 1}:`, {
                            id: item.id,
                            periodStart: item.periodStart,
                            periodEnd: item.periodEnd,
                            sellerId: item.sellerId
                        });
                    }
                });
            }
            
            setPayouts(res || []);
            
            // 하루 단위로 재구성
            await createDailyPayoutsFromDetails(res || []);
            
            // 요약 정보도 함께 조회
            const summaryRes = await getSellerSettlementSummary(from, to);
            console.log('요약 정보:', summaryRes);
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
            alert(errorMessage);
        }
    };

    // 필터 적용
    const applyFilter = () => {
        if (filterType === 'date' && filterDate) {
            fetchFilteredByDate(filterDate);
        } else if (filterType === 'period' && filterFrom && filterTo) {
            fetchFilteredByPeriod(filterFrom, filterTo);
        } else if (filterType === 'all') {
            fetchAll();
        }
    };

    // 필터 초기화
    const resetFilter = () => {
        setFilterType('date');
        setFilterDate(getTodayDate());
        setFilterFrom('');
        setFilterTo('');
        setSummary(null);
        fetchFilteredByDate(getTodayDate());
    };

    // 필터 타입 변경 핸들러
    const handleFilterTypeChange = (type: 'all' | 'date' | 'period') => {
        setFilterType(type);
        
        if (type === 'all') {
            // 전체 조회 즉시 실행
        fetchAll();
        } else if (type === 'date') {
            // 현재 설정된 날짜로 조회 (없으면 오늘 날짜)
            const dateToUse = filterDate || getTodayDate();
            setFilterDate(dateToUse);
            fetchFilteredByDate(dateToUse);
        } else if (type === 'period') {
            // 기간별 필터는 시작일/종료일이 모두 설정되어야 조회
            if (filterFrom && filterTo) {
                fetchFilteredByPeriod(filterFrom, filterTo);
            }
        }
    };

    // 날짜 필터 변경 핸들러
    const handleDateChange = (date: string) => {
        setFilterDate(date);
        if (filterType === 'date' && date) {
            fetchFilteredByDate(date);
        }
    };

    // 기간 필터 변경 핸들러
    const handlePeriodChange = (from: string, to: string) => {
        if (from) setFilterFrom(from);
        if (to) setFilterTo(to);
        
        // 시작일과 종료일이 모두 있으면 자동 조회
        const fromDate = from || filterFrom;
        const toDate = to || filterTo;
        
        if (filterType === 'period' && fromDate && toDate) {
            fetchFilteredByPeriod(fromDate, toDate);
        }
    };

    useEffect(() => {
        if (checking) return;
        // 초기 로딩 시 오늘 날짜 기준으로 조회
        fetchFilteredByDate(getTodayDate());
    }, [checking]);

    // 정산 상세 데이터를 날짜별 + 건별로 분리하여 정산 목록 생성
    const createDailyPayoutsFromDetails = async (payoutList: SellerSettlementResponse[]) => {
        try {
            console.log('=== 정산 데이터 가공 시작 ===');
            console.log('입력된 정산 목록:', payoutList);
            
            const dailyData: DailySettlementItem[] = [];
            
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
                    
                    // 각 salesDetail을 개별 항목으로 처리
                    detail.salesDetails.forEach((saleDetail, index) => {
                        const saleDate = saleDetail.salesLog.soldAt.split('T')[0]; // YYYY-MM-DD 형식으로 변환
                        console.log(`판매 건 ${index + 1}:`, {
                            saleDate,
                            productId: saleDetail.salesLog.productId,
                            totalPrice: saleDetail.salesLog.totalPrice,
                            soldAt: saleDetail.salesLog.soldAt
                        });
                        
                        // 기간 필터링이 활성화된 경우 실제 판매일 기준으로 필터링
                        if (filterType === 'period' && filterFrom && filterTo) {
                            if (saleDate < filterFrom || saleDate > filterTo) {
                                console.log(`판매일 ${saleDate}가 필터 기간 ${filterFrom}~${filterTo} 밖이므로 제외`);
                                return; // 해당 건 제외
                            }
                        } else if (filterType === 'date' && filterDate) {
                            if (saleDate !== filterDate) {
                                console.log(`판매일 ${saleDate}가 필터 날짜 ${filterDate}와 다르므로 제외`);
                                return; // 해당 건 제외
                            }
                        }
                        
                        console.log(`판매 건 ${index + 1} 포함됨:`, saleDate);
                        
                        dailyData.push({
                            id: `${payout.id}_${saleDate}_${index}`, // 고유 ID 생성 (건별)
                            originalPayoutId: payout.id,
                            sellerId: payout.sellerId,
                            date: saleDate,
                            periodStart: saleDate,
                            periodEnd: saleDate,
                            totalSales: saleDetail.salesLog.totalPrice, // 개별 주문 금액
                            totalCommission: saleDetail.commissionLog.commissionAmount, // 개별 수수료
                            payoutAmount: saleDetail.salesLog.totalPrice - saleDetail.commissionLog.commissionAmount, // 개별 지급액
                            processedAt: payout.processedAt,
                            salesCount: 1, // 개별 건이므로 항상 1
                            salesDetails: [saleDetail], // 해당 건의 상세 내역
                            // 추가 정보
                            productId: saleDetail.salesLog.productId,
                            customerId: saleDetail.salesLog.customerId,
                            quantity: saleDetail.salesLog.quantity,
                            unitPrice: saleDetail.salesLog.unitPrice,
                            orderItemId: saleDetail.salesLog.orderItemId,
                            soldAt: saleDetail.salesLog.soldAt
                        });
                    });
                } catch (detailError) {
                    console.error(`정산 상세 조회 실패 (ID: ${payout.id}):`, detailError);
                    // 상세 조회 실패 시 원본 데이터를 하루 단위로 변환
                    dailyData.push({
                        id: `${payout.id}_${payout.periodStart}_fallback`,
                        originalPayoutId: payout.id,
                        sellerId: payout.sellerId,
                        date: payout.periodStart,
                        periodStart: payout.periodStart,
                        periodEnd: payout.periodEnd,
                        totalSales: payout.totalSales,
                        totalCommission: payout.totalCommission,
                        payoutAmount: payout.payoutAmount,
                        processedAt: payout.processedAt,
                        salesCount: 1,
                        salesDetails: []
                    });
                }
            }
            
            // 날짜순, 시간순으로 정렬 (최신순)
            dailyData.sort((a, b) => {
                const dateA = new Date(a.soldAt || a.date).getTime();
                const dateB = new Date(b.soldAt || b.date).getTime();
                return dateB - dateA;
            });
            
            console.log('판매일별 + 건별로 분리된 정산 데이터:', dailyData);
            setDailyPayouts(dailyData);
            
        } catch (error) {
            console.error('판매일별 + 건별 정산 데이터 생성 실패:', error);
            setDailyPayouts([]);
        }
    };

    // 통계 계산 (건별로 분리된 결과 사용)
    const totalSettlements = dailyPayouts.length;
    const totalSales = dailyPayouts.reduce((sum, item) => sum + item.totalSales, 0);
    const totalCommission = dailyPayouts.reduce((sum, item) => sum + item.totalCommission, 0);
    const totalPayout = dailyPayouts.reduce((sum, item) => sum + item.payoutAmount, 0);

    // 정산 상태별 통계 계산
    const getSettlementStatus = (item: any) => {
        const saleDate = new Date(item.soldAt || item.date);
        const settlementDate = new Date(saleDate);
        settlementDate.setDate(saleDate.getDate() + 7);
        const today = new Date();
        
        if (settlementDate < today) return 'completed'; // 정산 완료
        if (settlementDate.toDateString() === today.toDateString()) return 'today'; // 오늘 정산
        return 'pending'; // 정산 대기
    };

    const pendingSettlements = dailyPayouts.filter(item => getSettlementStatus(item) === 'pending');
    const todaySettlements = dailyPayouts.filter(item => getSettlementStatus(item) === 'today');
    const completedSettlements = dailyPayouts.filter(item => getSettlementStatus(item) === 'completed');

    const pendingAmount = pendingSettlements.reduce((sum, item) => sum + item.payoutAmount, 0);
    const todayAmount = todaySettlements.reduce((sum, item) => sum + item.payoutAmount, 0);
    const completedAmount = completedSettlements.reduce((sum, item) => sum + item.payoutAmount, 0);

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
                        <h1 className="text-xl md:text-2xl font-bold text-[#374151]">정산 관리 (주문별)</h1>
                        {filterType === 'date' && (
                            <p className="text-sm text-[#6b7280] mt-1">
                                조회 날짜: {filterDate} {filterDate === getTodayDate() && '(오늘)'} - 해당 날짜에 판매된 각 주문의 정산 내역
                            </p>
                        )}
                        {filterType === 'period' && filterFrom && filterTo && (
                            <p className="text-sm text-[#6b7280] mt-1">
                                조회 기간: {filterFrom} ~ {filterTo} - 해당 기간에 판매된 각 주문의 정산 내역
                            </p>
                        )}
                        {filterType === 'all' && (
                            <p className="text-sm text-[#6b7280] mt-1">
                                전체 기간 조회 - 모든 판매 주문의 정산 내역
                            </p>
                        )}
                    </div>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-8 h-8 text-blue-600" />
                                <span className="text-[#374151] text-sm font-semibold">정산 대기</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{pendingSettlements.length}건</div>
                            <div className="text-sm font-semibold text-blue-600">{pendingAmount.toLocaleString()}원</div>
                            <div className="text-xs text-[#6b7280] mt-1">앞으로 정산 예정</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <span className="text-[#374151] text-sm font-semibold">오늘 정산</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{todaySettlements.length}건</div>
                            <div className="text-sm font-semibold text-green-600">{todayAmount.toLocaleString()}원</div>
                            <div className="text-xs text-[#6b7280] mt-1">오늘 정산 처리</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-8 h-8 text-gray-600" />
                                <span className="text-[#374151] text-sm font-semibold">정산 완료</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-600">{completedSettlements.length}건</div>
                            <div className="text-sm font-semibold text-gray-600">{completedAmount.toLocaleString()}원</div>
                            <div className="text-xs text-[#6b7280] mt-1">이미 정산됨</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">총 정산액</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{summary ? summary.totalPayoutAmount.toLocaleString() : totalPayout.toLocaleString()}원</div>
                            <div className="text-xs text-[#6b7280] mt-1">
                                {filterType === 'date' && `${filterDate} 당일`}
                                {filterType === 'period' && `${filterFrom}~${filterTo}`}
                                {filterType === 'all' && '전체 기간'}
                            </div>
                        </section>
                    </div>

                    {/* 정산 예정 현황 (대기 중인 정산이 있을 때만 표시) */}
                    {pendingSettlements.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-[#374151] mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                정산 예정 현황
                                <span className="text-sm font-normal text-[#6b7280]">({pendingSettlements.length}건 대기 중)</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {(() => {
                                    // 정산 예정일별로 그룹핑
                                    const groupedByDate = pendingSettlements.reduce((acc: any, item) => {
                                        const saleDate = new Date(item.soldAt || item.date);
                                        const settlementDate = new Date(saleDate);
                                        settlementDate.setDate(saleDate.getDate() + 7);
                                        const dateKey = `${settlementDate.getFullYear()}-${String(settlementDate.getMonth() + 1).padStart(2, '0')}-${String(settlementDate.getDate()).padStart(2, '0')}`;
                                        
                                        if (!acc[dateKey]) {
                                            acc[dateKey] = {
                                                date: dateKey,
                                                dateObj: settlementDate,
                                                items: [],
                                                totalAmount: 0,
                                                count: 0
                                            };
                                        }
                                        
                                        acc[dateKey].items.push(item);
                                        acc[dateKey].totalAmount += item.payoutAmount;
                                        acc[dateKey].count += 1;
                                        
                                        return acc;
                                    }, {});
                                    
                                    // 날짜순으로 정렬
                                    const sortedGroups = Object.values(groupedByDate).sort((a: any, b: any) => 
                                        a.dateObj.getTime() - b.dateObj.getTime()
                                    );
                                    
                                    return sortedGroups.slice(0, 8).map((group: any) => { // 최대 8개까지만 표시
                                        const today = new Date();
                                        const daysFromToday = Math.ceil((group.dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                        
                                        return (
                                            <div key={group.date} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-sm font-semibold text-blue-800">
                                                        {group.date}
                                                    </div>
                                                    <div className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">
                                                        {daysFromToday === 0 ? '오늘' : 
                                                         daysFromToday === 1 ? '내일' : 
                                                         daysFromToday > 0 ? `${daysFromToday}일 후` : 
                                                         `${Math.abs(daysFromToday)}일 지남`}
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold text-blue-700">
                                                    {group.totalAmount.toLocaleString()}원
                                                </div>
                                                <div className="text-sm text-blue-600">
                                                    {group.count}건의 정산 예정
                                                </div>
                                                {group.count > 3 && (
                                                    <div className="text-xs text-blue-500 mt-1">
                                                        상품 {group.count}개의 정산
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            {(() => {
                                // 정산 예정일 개수 계산
                                const uniqueDates = new Set();
                                pendingSettlements.forEach(item => {
                                    const saleDate = new Date(item.soldAt || item.date);
                                    const settlementDate = new Date(saleDate);
                                    settlementDate.setDate(saleDate.getDate() + 7);
                                    const dateKey = `${settlementDate.getFullYear()}-${String(settlementDate.getMonth() + 1).padStart(2, '0')}-${String(settlementDate.getDate()).padStart(2, '0')}`;
                                    uniqueDates.add(dateKey);
                                });
                                
                                return uniqueDates.size > 8 && (
                                    <div className="mt-4 text-center">
                                        <div className="text-sm text-[#6b7280]">
                                            총 {uniqueDates.size}개의 정산 예정일이 있습니다. 하단 표에서 전체 내역을 확인하세요.
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

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
                                    onClick={() => handleFilterTypeChange('date')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filterType === 'date' 
                                            ? 'bg-[#d1d5db] text-[#374151] shadow-sm'
                                            : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] hover:text-[#374151]'
                                    }`}
                                >
                                    주문별
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

                            {/* 날짜별 필터 */}
                            {filterType === 'date' && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#6b7280]" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                        className="border border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-[#374151] transition-all"
                                    />
                                    <button
                                        onClick={() => handleDateChange(getTodayDate())}
                                        className="bg-green-100 text-green-800 px-3 py-2 rounded-md hover:bg-green-200 text-sm font-medium transition-colors"
                                    >
                                        오늘
                                    </button>
                                </div>
                            )}

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
                        <button
                                    onClick={resetFilter}
                                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <Calendar className="w-4 h-4" />
                                    오늘로 초기화
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
                                {filterType === 'date' ? `${filterDate} 날짜에 판매된 주문의 정산 내역이 없습니다.` : '판매된 주문의 정산 내역이 없습니다.'}
                            </p>
                            {filterType === 'date' && (
                                <p className="text-[#6b7280] text-sm mt-2">
                                    다른 날짜를 선택하거나 "전체" 필터를 사용해 보세요.
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* 데이터 검증 안내 */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center mt-0.5">i</div>
                                    <div>
                                        <h4 className="font-semibold text-blue-800 mb-1">주문별 정산 데이터 안내</h4>
                                        <p className="text-blue-700 text-sm">
                                            {filterType === 'date' 
                                                ? `${filterDate} 날짜에 판매된 각 주문의 정산 내역입니다. 각 행은 개별 주문을 나타내며, "상세 보기"를 클릭하여 해당 주문의 상세 정보를 확인할 수 있습니다.`
                                                : '각 행은 개별 주문을 나타내며, "상세 보기"를 클릭하여 해당 주문의 상세 정보를 확인할 수 있습니다.'
                                            } 
                                            모든 주문 정보가 정확하게 표시됩니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                        <div className="overflow-x-auto bg-[#f3f4f6] rounded-lg shadow-sm border border-[#d1d5db]">
                            <table className="min-w-full divide-y divide-[#d1d5db]">
                                <thead className="bg-[#f3f4f6]">
                                    <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">판매일시</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상품ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">고객ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">수량/단가</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">총 매출</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">수수료</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">지급액</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">정산 처리일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상세보기</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                                        {dailyPayouts.map((item) => {
                                            const status = getSettlementStatus(item);
                                            const rowBgClass = 
                                                status === 'pending' ? 'bg-blue-50 hover:bg-blue-100' :
                                                status === 'today' ? 'bg-green-50 hover:bg-green-100' :
                                                'bg-gray-50 hover:bg-gray-100';
                                            
                                            return (
                                                <tr key={item.id} className={`${rowBgClass} transition-colors`}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-[#374151]">
                                                        <div>
                                                            <div className="font-semibold">
                                                                {item.date} {item.date === getTodayDate() && '(오늘)'}
                                                            </div>
                                                            <div className="text-xs text-[#6b7280]">
                                                                {item.soldAt ? item.soldAt.split('T')[1]?.split('.')[0] : '-'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#374151]">
                                                        {item.productId || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#374151]">
                                                        {item.customerId || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#374151]">
                                                        <div>
                                                            <div>{item.quantity || '-'}개</div>
                                                            <div className="text-xs text-[#6b7280]">
                                                                {item.unitPrice ? `${item.unitPrice.toLocaleString()}원` : '-'}
                                                            </div>
                                                        </div>
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
                                                        <div className="flex items-center justify-center gap-2">
                                                            {status === 'pending' && <Clock className="w-4 h-4 text-blue-600" />}
                                                            {status === 'today' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                            {status === 'completed' && <DollarSign className="w-4 h-4 text-gray-600" />}
                                                            <div className="text-sm text-[#374151]">
                                                                {(() => {
                                                                    // 정산 처리일 계산: 판매일 + 7일
                                                                    const saleDate = new Date(item.soldAt || item.date);
                                                                    const settlementDate = new Date(saleDate);
                                                                    settlementDate.setDate(saleDate.getDate() + 7);
                                                                    
                                                                    // 오늘 날짜와 비교
                                                                    const today = new Date();
                                                                    const isToday = settlementDate.toDateString() === today.toDateString();
                                                                    const isPast = settlementDate < today;
                                                                    const isFuture = settlementDate > today;
                                                                    
                                                                    return (
                                                                        <div className={`${
                                                                            isToday ? 'text-green-600 font-semibold' : 
                                                                            isPast ? 'text-gray-600' : 
                                                                            'text-blue-600'
                                                                        }`}>
                                                                            {settlementDate.getFullYear()}-{String(settlementDate.getMonth() + 1).padStart(2, '0')}-{String(settlementDate.getDate()).padStart(2, '0')}
                                                                            {isToday && ' (오늘)'}
                                                                            {isFuture && ' (예정)'}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-[#6b7280]">
                                                            판매일 + 7일
                                                        </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                            onClick={() => {
                                                                // 개별 주문 상세 데이터를 모달에 표시
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
                                    <h3 className="text-xl font-bold text-[#374151]">정산 상세 정보</h3>
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
