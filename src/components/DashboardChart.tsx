"use client";
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const series = [44, 55, 13, 43, 22]; // 도넛 차트용 더미 데이터

const options: ApexOptions = {
  chart: {
    type: 'donut',
    height: 350,
  },
  labels: ['A', 'B', 'C', 'D', 'E'], // 각 도넛 조각의 이름
  title: {
    text: '도넛형 예시 차트',
    align: 'left',
  },
};

const DashboardChart: React.FC = () => (
  <div>
    <ReactApexChart options={options} series={series} type="donut" height={350} />
  </div>
);

export default DashboardChart; 