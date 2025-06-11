import React from 'react';
import Link from 'next/link';
import DashboardChart from '@/components/DashboardChart';

const AdminDashboardPage = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <DashboardChart />
      <div>
        <h2>Statistics</h2>
        <p>Total Customers: 100</p>
        <p>Total Sellers: 50</p>
        <p>Total Products: 200</p>
        <p>Total Auctions: 30</p>
      </div>
      <Link href="/admin/login">Logout</Link>
    </div>
  );
};

export default AdminDashboardPage; 