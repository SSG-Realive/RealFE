// src/app/seller/dashboard/page.tsx 

'use client';

import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import TrafficLightStatusCard from '@/components/seller/TrafficLightStatusCard';
import { getDashboard, getSalesStatistics, getDailySalesTrend, getMonthlySalesTrend } from '@/service/seller/sellerService';
import { SellerDashboardResponse, SellerSalesStatsDTO, DailySalesDTO, MonthlySalesDTO } from '@/types/seller/dashboard/sellerDashboardResponse';
import { useEffect, useState } from 'react';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import dynamic from 'next/dynamic';
import { TrendingUp, Users, Star, DollarSign, Package, MessageCircle, ShoppingCart, BarChart3, Gavel, Armchair, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// ApexCharts를 동적으로 import (SSR 문제 방지)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function SellerDashboardPage() {
  const checking = useSellerAuthGuard();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<SellerDashboardResponse | null>(null);
  const [salesStats, setSalesStats] = useState<SellerSalesStatsDTO | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailySalesDTO[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlySalesDTO[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartFilter, setChartFilter] = useState<'daily' | 'monthly'>('daily');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // 기본 대시보드 데이터
      const dashboardData = await getDashboard();
      setDashboard(dashboardData);

      // 총 매출(전체 누적) 통계
      const statsStartDate = '2000-01-01'; // sales_logs의 가장 과거 날짜로 충분히 이전 날짜
      const statsEndDate = new Date().toISOString().split('T')[0];
      const statsData = await getSalesStatistics(statsStartDate, statsEndDate);
      setSalesStats(statsData);

      // 일별 추이 (최근 30일)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dailyData = await getDailySalesTrend(startDate, endDate);
      setDailyTrend(dailyData);

      // 월별 추이 (최근 6개월)
      const endMonthDate = new Date();
      const startMonthDate = new Date();
      startMonthDate.setMonth(endMonthDate.getMonth() - 5);
      startMonthDate.setDate(1); // 각 월의 1일로 맞추기
      const startMonthStr = startMonthDate.toISOString().split('T')[0];
      const endMonthStr = endMonthDate.toISOString().split('T')[0];
      const monthlyData = await getMonthlySalesTrend(startMonthStr, endMonthStr);
      setMonthlyTrend(monthlyData);

      setLastUpdated(format(new Date(), 'M월 d일 a h:mm'));
    } catch (err) {
      console.error('대시보드 정보 가져오기 실패', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  useEffect(() => {
    if (checking) {
      return;
    }

    fetchDashboardData();
  }, [checking]);

  // 최근 6개월 yearMonth 배열 생성
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7)); // 'YYYY-MM'
  }
  // monthlyTrend를 yearMonth 기준으로 매칭, 없으면 0원
  const monthlyTrendFilled = months.map(month => {
    const found = monthlyTrend.find(item => item.yearMonth === month);
    return found || { yearMonth: month, orderCount: 0, revenue: 0 };
  });

  // 일별 매출 차트 옵션
  const dailyChartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    colors: ['#a89f91'],
    fill: {
      type: 'gradient' as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: dailyTrend.map(item => item.date),
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280'
        },
        formatter: (value: number) => `${value.toLocaleString()}원`
      }
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toLocaleString()}원`
      }
    }
  };

  const dailyChartSeries = [
    {
      name: '일별 매출',
      data: dailyTrend.map(item => item.revenue)
    }
  ];

  // 월별 매출 차트 옵션
  const monthlyChartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: {
        show: false
      }
    },
    colors: ['#a89f91'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: monthlyTrendFilled.map(item => item.yearMonth),
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280'
        },
        formatter: (value: number) => `${value.toLocaleString()}원`
      }
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toLocaleString()}원`
      }
    }
  };

  const monthlyChartSeries = [
    {
      name: '월별 매출',
      data: monthlyTrendFilled.map(item => item.revenue)
    }
  ];

  if (checking || loading) {
    return (
      <SellerLayout>
        <main className="min-h-screen w-full px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-[#374151] tracking-wide mb-2">판매자 대시보드</h1>
              <p className="text-sm text-[#6b7280]">데이터를 불러오는 중...</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={true}
                className="inline-flex items-center gap-2 bg-[#d1d5db] text-[#374151] px-4 py-2 rounded-lg font-medium shadow-sm border border-[#d1d5db] opacity-50 cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                로딩 중...
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#374151]"></div>
            <span className="ml-3 text-[#374151] text-lg">대시보드 정보를 불러오는 중...</span>
          </div>
        </main>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <main className="min-h-screen w-full px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#374151] tracking-wide mb-2">판매자 대시보드</h1>
            {lastUpdated && (
              <p className="text-sm text-[#6b7280]">마지막 업데이트: {lastUpdated}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-[#d1d5db] text-[#374151] px-4 py-2 rounded-lg hover:bg-[#e5e7eb] transition-colors font-medium shadow-sm border border-[#d1d5db] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? '새로고침 중...' : '데이터 새로고침'}
            </button>
            <button
              onClick={() => setChartFilter('daily')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartFilter === 'daily'
                  ? 'bg-[#d1d5db] text-[#374151]'
                  : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#d1d5db] hover:text-[#374151] border-2 border-[#d1d5db]'
              }`}
            >
              일간
            </button>
            <button
              onClick={() => setChartFilter('monthly')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartFilter === 'monthly'
                  ? 'bg-[#d1d5db] text-[#374151]'
                  : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#d1d5db] hover:text-[#374151] border-2 border-[#d1d5db]'
              }`}
            >
              월간
            </button>
          </div>
        </div>
        {/* 상단 카드 레이아웃 */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* 좌측: 신호등 카드(크게) */}
          <div className="flex-1 min-w-[320px] max-w-[400px] flex items-stretch">
            <TrafficLightStatusCard
              title="판매자 등급"
              rating={dashboard?.averageRating ?? 0}
              count={dashboard?.totalReviews ?? 0}
              className="h-full w-full text-2xl"
            />
          </div>
          {/* 우측: 나머지 카드들 */}
          <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-6">
          <section
            className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] flex items-center justify-between cursor-pointer transition hover:scale-[1.03] hover:shadow-lg hover:border-[#14b8a6]"
            onClick={() => router.push('/seller/products')}
          >
            <div>
              <h2 className="text-[#374151] text-sm font-semibold mb-2">총 등록 상품</h2>
              <p className="text-xl md:text-2xl font-bold text-[#374151]">{dashboard?.totalProductCount ?? 0}개</p>
            </div>
            <Armchair className="w-8 h-8 text-[#6b7280]" />
          </section>
          <section className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] flex items-center gap-4">
            <DollarSign className="w-10 h-10 text-[#6b7280]" />
            <div>
              <h2 className="text-[#374151] text-sm font-semibold mb-1">총 매출</h2>
              <p className="text-2xl font-extrabold text-[#374151]">{salesStats?.totalRevenue?.toLocaleString() ?? 0}원</p>
            </div>
          </section>
          <section
            className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] flex items-center gap-4 cursor-pointer transition hover:scale-[1.03] hover:shadow-lg hover:border-[#14b8a6]"
            onClick={() => router.push('/seller/orders')}
          >
            <Gavel className="w-10 h-10 text-[#6b7280]" />
            <div>
              <h2 className="text-[#374151] text-sm font-semibold mb-1">총 주문 수</h2>
              <p className="text-2xl font-extrabold text-[#374151]">{salesStats?.totalOrders?.toLocaleString() ?? 0}건</p>
            </div>
          </section>
          <section
            className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] flex items-center gap-4 cursor-pointer transition hover:scale-[1.03] hover:shadow-lg hover:border-[#14b8a6]"
            onClick={() => router.push('/seller/qna')}
          >
            <MessageCircle className="w-10 h-10 text-[#6b7280]" />
            <div>
              <h2 className="text-[#374151] text-sm font-semibold mb-1">미답변 문의</h2>
              <p className="text-2xl font-extrabold text-[#6b7280]">{dashboard?.unansweredQnaCount ?? 0}건</p>
            </div>
          </section>
        </div>
        </div>
        
        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <section className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#374151]">매출 추이</h3>
              <BarChart3 className="w-7 h-7 text-[#6b7280] hover:text-[#14b8a6] transition-colors duration-150 cursor-pointer" />
            </div>
            <div className="w-full h-80 min-h-[320px]">
            {chartFilter === 'daily' ? (
                <Chart 
                  options={dailyChartOptions} 
                  series={dailyChartSeries} 
                  type="area" 
                  height="100%" 
                  width="100%"
                />
            ) : (
                <Chart 
                  options={monthlyChartOptions} 
                  series={monthlyChartSeries} 
                  type="bar" 
                  height="100%" 
                  width="100%"
                />
            )}
            </div>
          </section>
          <section className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#374151]">주문 통계</h3>
              <BarChart3 className="w-7 h-7 text-[#6b7280] hover:text-[#14b8a6] transition-colors duration-150 cursor-pointer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#f3f4f6] rounded-lg border border-[#d1d5db]">
                <p className="text-sm text-[#374151] mb-1">오늘 주문</p>
                <p className="text-xl font-bold text-[#374151]">
                  {dailyTrend.length > 0 ? dailyTrend[dailyTrend.length - 1]?.orderCount || 0 : 0}건
                </p>
              </div>
              <div className="text-center p-4 bg-[#f3f4f6] rounded-lg border border-[#d1d5db]">
                <p className="text-sm text-[#374151] mb-1">이번 달 주문</p>
                <p className="text-xl font-bold text-[#374151]">
                  {monthlyTrendFilled.length > 0 ? monthlyTrendFilled[monthlyTrendFilled.length - 1]?.orderCount || 0 : 0}건
                </p>
              </div>
            </div>
          </section>
        </div>
        {/* 최근 인기 경매/판매 TOP3 등 추가 섹션은 필요시 확장 */}
      </main>
    </SellerLayout>
  );
}