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

