import { backend_url } from "../store/keyStore";


export const getRecentActivity = async (userId) => {
  try {
    const response = await fetch(`${backend_url}/recent-activity/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // only add if you use cookies / JWT in cookies
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recent activity");
    }

    const data = await response.json();
    return data;  // { success, count, activities }
    
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return null;
  }
};



export const getUserNotifications = async ({
  page = 1,
  limit = 20,
  unreadOnly = false
} = {}) => {
  try {
    const response = await fetch(
      `${backend_url}/notification?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    return data; // { notifications, pagination, unreadCount }

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

