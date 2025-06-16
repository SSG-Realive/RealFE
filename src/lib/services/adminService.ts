export async function getAdminDashboard(date: string, periodType: string): Promise<AdminDashboardDTO> {
  try {
    const response = await apiClient.get<AdminDashboardDTO>(
      `/api/admin/stats/main-dashboard?date=${date}&periodType=${periodType}`
    );
    // Return response.data.data to get the actual dashboard data
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch admin dashboard:', error);
    throw error;
  }
} 