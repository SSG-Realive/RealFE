import React from 'react';
import Link from 'next/link';

const AdminAuctionsPage = () => {
  return (
    <div>
      <h1>Admin Auctions</h1>
      <div>
        <h2>Auction List</h2>
        <ul>
          <li>Auction 1</li>
          <li>Auction 2</li>
          <li>Auction 3</li>
        </ul>
      </div>
      <Link href="/admin/dashboard">Back to Dashboard</Link>
    </div>
  );
};

export default AdminAuctionsPage; 