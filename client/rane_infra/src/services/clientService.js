import { backend_url } from "../store/keyStore";

// Client Dashboard API calls
export const clientService = {
  // Get dashboard statistics for a specific user
  getDashboardStats: async (userId) => {
    try {
      console.log('ClientService: Making dashboard request for userId:', userId);
      console.log('ClientService: Request URL:', `${backend_url}/dashboard/${userId}`);
      
      const response = await fetch(`${backend_url}/dashboard/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookie-based auth
      });

      console.log('ClientService: Response status:', response.status);
      const data = await response.json();
      console.log('ClientService: Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client dashboard stats');
      }

      return data;
    } catch (error) {
      console.error('ClientService: Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get client-specific bills
  getMyBills: async (userId) => {
    try {
      const response = await fetch(`${backend_url}/my-bills/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client bills');
      }

      return data;
    } catch (error) {
      console.error('Error fetching client bills:', error);
      throw error;
    }
  },

  // Get client-specific payments
  getMyPayments: async (userId) => {
    try {
      const response = await fetch(`${backend_url}/my-payments/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client payments');
      }

      return data;
    } catch (error) {
      console.error('Error fetching client payments:', error);
      throw error;
    }
  },

  // Get client-specific DFS requests
  getMyDfsRequests: async (userId) => {
    try {
      const response = await fetch(`${backend_url}/my-dfs-requests/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client DFS requests');
      }

      return data;
    } catch (error) {
      console.error('Error fetching client DFS requests:', error);
      throw error;
    }
  }
};

export default clientService;
