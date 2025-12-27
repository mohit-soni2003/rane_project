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
export const signAgreement = async (id, name, password) => {
  try {
    const res = await fetch(`${backend_url}/agreement/${id}/sign`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, password }), // ⬅️ MUST include password
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to sign agreement");
    }

    return data;
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


// Get agreements that require action (Pending + Viewed)
export const getClientActionAgreements = async () => {
  try {
    // Backend supports multiple statuses: ?status=Pending,Viewed
    const query = "?status=pending,viewed";

    const res = await fetch(`${backend_url}/agreement/client${query}`, {
      method: "GET",
      credentials: "include", // send JWT cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch actionable agreements");
    }

    return data;
    // { success, count, agreements: [...] }
  } catch (error) {
    console.error("Error fetching actionable agreements:", error);
    throw error;
  }
};


/**
 * Create a new agreement (Admin / Staff)
 * POST /agreements/create
 */
export const createAgreement = async (payload) => {
  try {
    const res = await fetch(`${backend_url}/agreement/create`, {
      method: "POST",
      credentials: "include", // JWT cookie
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log(payload)
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to create agreement");
    }

    return data;
    // { success, message, agreement }
  } catch (error) {
    console.error("Error creating agreement:", error);
    throw error;
  }
};

// Request agreement extension (Client)
export const requestAgreementExtension = async (id, payload) => {
  try {
    const res = await fetch(
      `${backend_url}/agreement/${id}/request-extension`,
      {
        method: "PATCH",
        credentials: "include", // send JWT cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // { requestedExpiryDate, reason }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to request agreement extension");
    }

    return data;
    // { success: true, message, agreement }
  } catch (error) {
    console.error("Error requesting agreement extension:", error);
    throw error;
  }
};

/**
 * Review agreement extension request (Admin / Staff)
 * @param {string} id - Agreement ID
 * @param {"approved" | "rejected"} decision
 */
export const reviewAgreementExtension = async (id, decision) => {
  try {
    const res = await fetch(
      `${backend_url}/agreement/${id}/review-extension`,
      {
        method: "PATCH",
        credentials: "include", // JWT cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to review extension request");
    }

    return data;
    // { success, message, agreement }
  } catch (error) {
    console.error("Error reviewing agreement extension:", error);
    throw error;
  }
};


/**
 * Get all agreements (Admin / Staff)
 * @param {boolean} mine - true → only agreements uploaded by logged-in user
 * @returns {Object} { success, total, agreements }
 */
export const getAllAgreements = async (mine = false) => {
  try {
    const query = mine ? "?mine=true" : "";

    const res = await fetch(
      `${backend_url}/agreement/all${query}`,
      {
        method: "GET",
        credentials: "include", // JWT cookie
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch agreements");
    }

    return data;
    // { success, total, agreements }
  } catch (error) {
    console.error("Error fetching all agreements:", error);
    throw error;
  }
};
