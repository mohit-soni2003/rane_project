import { backend_url } from "../store/keyStore";

export const sorService = {
  // Get all SOR data grouped by schedule
  getSORData: async () => {
    try {
      const response = await fetch(`${backend_url}/sor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch SOR data');
      }

      if (!data.success || !data.data) {
        throw new Error('Unexpected response format');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching SOR data:', error);
      throw error;
    }
  },
};