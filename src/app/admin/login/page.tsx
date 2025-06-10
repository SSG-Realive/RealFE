import React from 'react';
import Link from 'next/link';

const AdminLoginPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h1>Admin Login</h1>
        <form>
          <div>
            <label>Username:</label>
            <input type="text" />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" />
          </div>
          <button type="submit">Login</button>
        </form>
        <Link href="/admin/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
};

export default AdminLoginPage; 