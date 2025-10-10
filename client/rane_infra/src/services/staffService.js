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

  // Get staff-specific bills - using the existing bill route
  getMyBills: async () => {
    try {
      const response = await fetch(`${backend_url}/allbill`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle both success response and error response
      if (data.error) {
        console.log('No bills found:', data.error);
        return {
          success: true,
          bills: []
        };
      }

      // The API returns bills directly as an array
      return {
        success: true,
        bills: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error('Error fetching staff bills:', error);
      return {
        success: false,
        bills: [],
        error: error.message
      };
    }
  },

  // Get staff-specific payments - using the existing payment route
  getMyPayments: async () => {
    try {
      const response = await fetch(`${backend_url}/allpayment`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle both success response and error response
      if (data.error) {
        console.log('No payments found:', data.error);
        return {
          success: true,
          payments: []
        };
      }

      // The API returns payments directly as an array
      return {
        success: true,
        payments: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error('Error fetching staff payments:', error);
      return {
        success: false,
        payments: [],
        error: error.message
      };
    }
  },

  // Get staff-specific DFS requests - using the existing DFS route
  getMyDfsRequests: async () => {
    try {
      const response = await fetch(`${backend_url}/dfs/getAllFiles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch DFS requests');
      }

      return {
        success: true,
        dfsRequests: data.files || data || []
      };
    } catch (error) {
      console.error('Error fetching staff DFS requests:', error);
      return {
        success: false,
        dfsRequests: [],
        error: error.message
      };
    }
  }
};

export default staffService;
