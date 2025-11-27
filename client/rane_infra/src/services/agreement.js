import { backend_url } from "../store/keyStore";

// Get agreement details by ID of agreement
export const getAgreementById = async (id) => {
  try {
    const res = await fetch(`${backend_url}/agreement/view/${id}`, {
      method: "GET",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch agreement");
    }

    return data; // { success, agreement }
  } catch (error) {
    console.error("Error fetching agreement by ID:", error);
    throw error;
  }
};

// Get all agreements for the logged-in client (optionally filtered by status)
export const getClientAgreements = async (status = "") => {
  try {
    // If status is provided → append '?status=value'
    const query = status ? `?status=${status}` : "";

    const res = await fetch(`${backend_url}/agreement/client${query}`, {
      method: "GET",
      credentials: "include",  // sends cookies (JWT)
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch client agreements");
    }

    return data; 
    // { success, count, agreements: [...] }
  } catch (error) {
    console.error("Error fetching client agreements:", error);
    throw error;
  }
};


// Sign agreement by ID
export const signAgreement = async (id, name) => {
  try {
    const res = await fetch(`${backend_url}/agreement/${id}/sign`, {
      method: "PATCH",
      credentials: "include", // send cookies (JWT)
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to sign agreement");
    }

    return data; 
    // { success: true, message: "...", agreement: {...} }
  } catch (error) {
    console.error("Error signing agreement:", error);
    throw error;
  }
};


// Reject agreement by ID
export const rejectAgreement = async (id, reason) => {
  try {
    const res = await fetch(`${backend_url}/agreement/${id}/reject`, {
      method: "PATCH",
      credentials: "include", // include JWT cookies
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }), // sending the reason
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to reject agreement");
    }

    return data; 
    // { success: true, message: "...", agreement: {...} }
  } catch (error) {
    console.error("Error rejecting agreement:", error);
    throw error;
  }
};
