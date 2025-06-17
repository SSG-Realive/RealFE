import { AdminDashboardDTO } from '@/types/admin/admin';

const API_URL = '/api/admin';

export const getAdminDashboard = async (date: string, periodType: string): Promise<AdminDashboardDTO> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(
      `${API_URL}/stats/main-dashboard?date=${date}&periodType=${periodType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch admin dashboard:', error);
    throw error;
  }
}; 