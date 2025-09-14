import { backend_url } from "../store/keyStore";

// Staff Dashboard API calls
export const staffService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${backend_url}/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookie-based auth
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }

      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get staff-specific bills
  getMyBills: async () => {
    try {
      const response = await fetch(`${backend_url}/my-bills`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch staff bills');
      }

      return data;
    } catch (error) {
      console.error('Error fetching staff bills:', error);
      throw error;
    }
  },

  // Get staff-specific payments
  getMyPayments: async () => {
    try {
      const response = await fetch(`${backend_url}/my-payments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch staff payments');
      }

      return data;
    } catch (error) {
      console.error('Error fetching staff payments:', error);
      throw error;
    }
  },

  // Get staff-specific DFS requests
  getMyDfsRequests: async () => {
    try {
      const response = await fetch(`${backend_url}/my-dfs-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch staff DFS requests');
      }

      return data;
    } catch (error) {
      console.error('Error fetching staff DFS requests:', error);
      throw error;
    }
  }
};

export default staffService;
