import { backend_url } from "../store/keyStore";
// shows all trsnsaction of particualr bill by bill id 
export const getTransactionsByBillId = async (billId) => {
  try {
    const res = await fetch(`${backend_url}/transactions/${billId}`, {
      method: 'GET',
      credentials: 'include', // include cookies if you're using authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch transactions');
    }

    return data.transactions;
  } catch (error) {
    console.error('Error fetching transactions for bill:', error);
    throw error;
  }
};
// shows all trsnsaction of particualr payment request by PR  id 
export const getTransactionsByPaymentId = async (paymentId) => {
  try {
    const response = await fetch(`${backend_url}/transactions/payreq/${paymentId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch transactions');
    }

    return data.transactions;
  } catch (err) {
    console.error('Error fetching transactions:', err.message);
    throw err;
  }
};
// ✅ Get all transactions (Bill + PayReq) for a user from backend
export const getAllTransactionsByUserId = async (userId) => {
  try {
    const res = await fetch(`${backend_url}/transaction/all/${userId}`, {
      method: "GET",
      credentials: "include", // include cookies if authentication is required
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch transactions");
    }

    return data.transactions || [];
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    throw error;
  }
};
