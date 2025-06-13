"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AdminDashboardDTO } from '@/types/admin';
import { getAdminDashboard } from '@/service/adminService';

const DashboardChart = dynamic(() => import('@/components/DashboardChart'), { ssr: false });

const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<'DAILY' | 'MONTHLY'>('DAILY');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const data = await getAdminDashboard(today, periodType);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [periodType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-500 mb-4">
            <h2 className="text-xl font-semibold">Error</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as 'DAILY' | 'MONTHLY')}
            className="border rounded-md px-3 py-2"
          >
            <option value="DAILY">Daily</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Sellers</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.pendingSellerCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData.salesSummaryStats.totalOrdersInPeriod}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">${dashboardData.salesSummaryStats.totalRevenueInPeriod.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Fees</h3>
            <p className="text-3xl font-bold text-orange-600">${dashboardData.salesSummaryStats.totalFeesInPeriod.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <DashboardChart data={dashboardData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Penalties</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.penaltyLogs.map((penalty) => (
                  <tr key={penalty.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{penalty.customerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{penalty.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{penalty.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{penalty.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Auction Statistics</h3>
          <div className="space-y-2">
            <p>Total Auctions: {dashboardData.auctionSummaryStats.totalAuctionsInPeriod}</p>
            <p>Total Bids: {dashboardData.auctionSummaryStats.totalBidsInPeriod}</p>
            <p>Average Bids per Auction: {dashboardData.auctionSummaryStats.averageBidsPerAuctionInPeriod.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Object.assign(AdminDashboardPage, { pageTitle: '대시보드' }); 