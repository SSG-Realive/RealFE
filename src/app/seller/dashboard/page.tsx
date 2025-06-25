// src/app/seller/dashboard/page.tsx 

'use client';

import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import { getDashboard, getSalesStatistics, getDailySalesTrend, getMonthlySalesTrend } from '@/service/seller/sellerService';
import { SellerDashboardResponse, SellerSalesStatsDTO, DailySalesDTO, MonthlySalesDTO } from '@/types/seller/dashboard/sellerDashboardResponse';
import { useEffect, useState } from 'react';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import dynamic from 'next/dynamic';
import { TrendingUp, Users, Star, DollarSign, Package, MessageCircle, ShoppingCart, BarChart3 } from 'lucide-react';

// ApexCharts를 동적으로 import (SSR 문제 방지)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function SellerDashboardPage() {
  const checking = useSellerAuthGuard();
  const [dashboard, setDashboard] = useState<SellerDashboardResponse | null>(null);
  const [salesStats, setSalesStats] = useState<SellerSalesStatsDTO | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailySalesDTO[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlySalesDTO[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (checking) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 기본 대시보드 데이터
        const dashboardData = await getDashboard();
        setDashboard(dashboardData);

        // 최근 30일 기준으로 통계 데이터
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // 판매 통계
        const statsData = await getSalesStatistics(startDate, endDate);
        setSalesStats(statsData);

        // 일별/월별 추이
        const dailyData = await getDailySalesTrend(startDate, endDate);
        setDailyTrend(dailyData);

        const monthlyData = await getMonthlySalesTrend(startDate, endDate);
        setMonthlyTrend(monthlyData);

      } catch (err) {
        console.error('대시보드 정보 가져오기 실패', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [checking]);

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
    colors: ['#3B82F6'],
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
    colors: ['#10B981'],
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
      categories: monthlyTrend.map(item => item.yearMonth),
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
      data: monthlyTrend.map(item => item.revenue)
    }
  ];

  if (checking || loading) {
    return (
      <SellerLayout>
        <main>
          <h1 className="text-xl md:text-2xl font-bold mb-4">판매자 대시보드</h1>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">로딩 중...</span>
          </div>
        </main>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <main className="space-y-6">
        <h1 className="text-xl md:text-2xl font-bold mb-6">판매자 대시보드</h1>
        
        {/* 기본 통계 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold mb-2">등록 상품 수</h2>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{dashboard?.totalProductCount || 0}개</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </section>
          
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold mb-2">미답변 문의</h2>
                <p className="text-xl md:text-2xl font-bold text-red-500">{dashboard?.unansweredQnaCount || 0}건</p>
              </div>
              <MessageCircle className="w-8 h-8 text-red-500" />
            </div>
          </section>
          
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold mb-2">진행 중인 주문</h2>
                <p className="text-xl md:text-2xl font-bold text-blue-500">{dashboard?.inProgressOrderCount || 0}건</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </section>
          
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold mb-2">누적 고객 수</h2>
                <p className="text-xl md:text-2xl font-bold text-green-600">{dashboard?.totalCustomers || 0}명</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </section>
        </div>

        {/* 판매 통계 카드들 */}
        {salesStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-600 text-sm font-semibold mb-2">총 주문 수</h2>
                  <p className="text-xl md:text-2xl font-bold text-indigo-600">{salesStats.totalOrders.toLocaleString()}건</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
            </section>
            
            <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-600 text-sm font-semibold mb-2">총 매출</h2>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{salesStats.totalRevenue.toLocaleString()}원</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </section>
            
            <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-600 text-sm font-semibold mb-2">평균 평점</h2>
                  <p className="text-xl md:text-2xl font-bold text-yellow-600">{dashboard?.averageRating?.toFixed(1) || '0.0'}점</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </section>
          </div>
        )}

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 일별 매출 추이 */}
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              일별 매출 추이 (최근 30일)
            </h2>
            {dailyTrend.length > 0 ? (
              <Chart
                options={dailyChartOptions}
                series={dailyChartSeries}
                type="area"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </section>

          {/* 월별 매출 추이 */}
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              월별 매출 추이
            </h2>
            {monthlyTrend.length > 0 ? (
              <Chart
                options={monthlyChartOptions}
                series={monthlyChartSeries}
                type="bar"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </section>
        </div>
      </main>
    </SellerLayout>
  );
}