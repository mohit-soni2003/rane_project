import { backend_url } from "../store/keyStore";

//TO UPDATE THE USER DETAIDLS OF INCLUDING PERSONAL DETAILS , PROFILE ETC------

export const updateUser = async (userData) => {
  try {
    const response = await fetch(`${backend_url}/update-user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to update user");
    }

    return data; // { message, user }
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};


export const getAllClients = async () => {
  try {
    const response = await fetch(`${backend_url}/allclient`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch clients');
    }

    return data;
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    return [];
  }
};

// THis route is for admin to vies full user detaules
export const getUserFullDetails = async (id) => {
  try {
    const res = await fetch(`${backend_url}/admin-get-users-details/${id}`);  // ✅ correct

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};


// CHANGE PASSWORD (using cookies for auth)
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch(`${backend_url}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ send cookies automatically
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password");
    }

    return data; // { success: true, message: "Password changed successfully" }
  } catch (error) {
    console.error("Error changing password:", error.message);
    throw error;
  }
};

// UPDATE ID PROOF (Aadhar / PAN)
// UPDATE ID PROOF (Aadhar / PAN)
export const updateIdProof = async (id, idproofData) => {
  try {
    console.log("[updateIdProof] outgoing payload:", { id, ...idproofData });

    const response = await fetch(`${backend_url}/update-idproof`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...idproofData }),
    });

    // try to parse any json response (even when !ok)
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

    console.log("[updateIdProof] response:", response.status, data);

    if (!response.ok) {
      // include server message when possible
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Error updating ID proof:", error.message || error);
    throw error;
  }
};

