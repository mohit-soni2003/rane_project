import { backend_url } from "../store/keyStore";

// Admin Dashboard API calls
export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${backend_url}/admin-dashboard-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookie-based auth
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch admin dashboard stats');
      }

      return data;
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  }
};

export default adminService;
