import { backend_url } from "../store/keyStore";

export const sorService = {

  // ─── GET /api/sor ─────────────────────────────────────────────────────────
  // Get all latest SOR items grouped by schedule
  // Access: admin, staff, client
  getSORData: async () => {
    try {
      const response = await fetch(`${backend_url}/sor`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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

  // ─── GET /api/sor/history ─────────────────────────────────────────────────
  // Get all items with all versions
  // Access: admin only
  getAllHistory: async () => {
    try {
      const response = await fetch(`${backend_url}/sor/history`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch SOR history');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching SOR history:', error);
      throw error;
    }
  },

  // ─── GET /api/sor/history/:item_number ───────────────────────────────────
  // Get full version history of one specific item
  // Access: admin only
  getItemHistory: async (item_number) => {
    try {
      const response = await fetch(`${backend_url}/sor/history/${item_number}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch history for item ${item_number}`);
      }

      return data.data;
    } catch (error) {
      console.error(`Error fetching history for item ${item_number}:`, error);
      throw error;
    }
  },

  // ─── POST /api/sor ────────────────────────────────────────────────────────
  // Add a brand new SOR item
  // Access: admin only
  addItem: async (itemData) => {
    try {
      const response = await fetch(`${backend_url}/sor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          item_number: itemData.item_number,
          schedule:    itemData.schedule,
          description: itemData.description,
          unit:        itemData.unit,
          rate_low:    Number(itemData.rate_low),
          rate_high:   itemData.rate_high ? Number(itemData.rate_high) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add SOR item');
      }

      return data.data;
    } catch (error) {
      console.error('Error adding SOR item:', error);
      throw error;
    }
  },

  // ─── PUT /api/sor/:item_number ────────────────────────────────────────────
  // Update an existing item — archives old version, creates new version
  // Access: admin only
  updateItem: async (item_number, updateData) => {
    try {
      const response = await fetch(`${backend_url}/sor/${item_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description: updateData.description,
          unit:        updateData.unit,
          rate_low:    Number(updateData.rate_low),
          rate_high:   updateData.rate_high ? Number(updateData.rate_high) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to update item ${item_number}`);
      }

      return data.data;
    } catch (error) {
      console.error(`Error updating item ${item_number}:`, error);
      throw error;
    }
  },

  // ─── DELETE /api/sor/:item_number ─────────────────────────────────────────
  // Delete latest version of an item (history preserved)
  // Access: admin only
  deleteItem: async (item_number) => {
    try {
      const response = await fetch(`${backend_url}/sor/${item_number}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete item ${item_number}`);
      }

      return data;
    } catch (error) {
      console.error(`Error deleting item ${item_number}:`, error);
      throw error;
    }
  },
};