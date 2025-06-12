"use client";
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { AdminDashboardDTO } from '@/types/admin';

interface DashboardChartProps {
  data: AdminDashboardDTO;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
  // 회원 통계 차트
  const memberOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: ['전체 회원', '신규 회원', '방문자', '참여자', '활동자'],
    title: {
      text: '회원 통계',
      align: 'left',
    },
    colors: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336'],
  };

  const memberSeries = [
    data.memberSummaryStats.totalMembers,
    data.memberSummaryStats.newMembersInPeriod,
    data.memberSummaryStats.uniqueVisitorsInPeriod,
    data.memberSummaryStats.engagedUsersInPeriod,
    data.memberSummaryStats.activeUsersInPeriod,
  ];

  // 판매 통계 차트
  const salesOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
      categories: data.productLog.salesWithCommissions.map(sale => 
        new Date(sale.salesLog.soldAt).toLocaleDateString()
      ),
    },
    title: {
      text: '판매 추이',
      align: 'left',
    },
    yaxis: {
      title: {
        text: '판매액',
      },
    },
  };

  const salesSeries = [{
    name: '판매액',
    data: data.productLog.salesWithCommissions.map(sale => sale.salesLog.totalPrice),
  }];

  // 경매 통계 차트
  const auctionOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    title: {
      text: '경매 통계',
      align: 'left',
    },
    xaxis: {
      categories: ['총 경매', '총 입찰', '평균 입찰', '성공률', '실패률'],
    },
  };

  const auctionSeries = [{
    name: '경매 통계',
    data: [
      data.auctionSummaryStats.totalAuctionsInPeriod,
      data.auctionSummaryStats.totalBidsInPeriod,
      data.auctionSummaryStats.averageBidsPerAuctionInPeriod,
      data.auctionSummaryStats.successRate * 100,
      data.auctionSummaryStats.failureRate * 100,
    ],
  }];

  // 리뷰 통계 차트
  const reviewOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: ['전체 리뷰', '신규 리뷰', '평균 평점', '삭제율'],
    title: {
      text: '리뷰 통계',
      align: 'left',
    },
    colors: ['#4CAF50', '#2196F3', '#FFC107', '#F44336'],
  };

  const reviewSeries = [
    data.reviewSummaryStats.totalReviewsInPeriod,
    data.reviewSummaryStats.newReviewsInPeriod,
    data.reviewSummaryStats.averageRatingInPeriod * 20, // 5점 만점을 100점으로 변환
    data.reviewSummaryStats.deletionRate * 100,
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #eee', padding: '24px' }}>
        <ReactApexChart options={memberOptions} series={memberSeries} type="donut" height={350} />
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #eee', padding: '24px' }}>
        <ReactApexChart options={salesOptions} series={salesSeries} type="line" height={350} />
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #eee', padding: '24px' }}>
        <ReactApexChart options={auctionOptions} series={auctionSeries} type="bar" height={350} />
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #eee', padding: '24px' }}>
        <ReactApexChart options={reviewOptions} series={reviewSeries} type="donut" height={350} />
      </div>
    </div>
  );
};

export default DashboardChart; 