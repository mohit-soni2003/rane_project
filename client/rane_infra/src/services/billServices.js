import { backend_url } from "../store/keyStore";

// Upload Bill to the Server---- this is done by client

export const postBill = async (billData) => {
  try {
    const response = await fetch(`${backend_url}/post-bill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(billData), 
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to post bill");
    }

    return result; // { message, bill }
  } catch (error) {
    console.error("Error posting bill:", error.message);
    throw error;
  }
};



// this route give all the bill to show to admin 
export const getAllBills = async () => {
  try {
    const res = await fetch(`${backend_url}/allbill`, {
      method: 'GET',
      credentials: 'include', // if using cookies for auth
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch bills');
    }

    return data;
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
};


// get the bill details by the id route 
export const getBillById = async (id) => {
  try {
    const res = await fetch(`${backend_url}/bill/${id}`, {
      method: 'GET',
      credentials: 'include', // include cookies if auth is used
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch bill');
    }

    return data;
  } catch (error) {
    console.error('Error fetching bill by ID:', error);
    throw error;
  }
};
// Get transactions for a specific bill
export const getBillTransactions = async (billId) => {
  try {
    const res = await fetch(`${backend_url}/transactions/${billId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch bill transactions');
    }

    return data.transactions || [];
  } catch (error) {
    console.error('Error fetching bill transactions:', error);
    throw error;
  }
};

export const getBillsByUserId = async (userId) => {
  try {
    const response = await fetch(`${backend_url}/mybill/${userId}`, {
      method: 'GET',
      credentials: 'include', // Optional: only if you're using cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user bills');
    }

    return data; // returns an array of bills or error message
  } catch (error) {
    console.error('Error fetching user bills:', error.message);
    throw error;
  }
};