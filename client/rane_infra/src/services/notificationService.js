// services/notificationService.js
import { backend_url } from "../store/keyStore";

export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      unreadOnly: String(unreadOnly),
    });

    const res = await fetch(`${backend_url}/notification?${params}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch notifications.");

    return {
      notifications: data.notifications || [],
      pagination: data.pagination || {},
      unreadCount: data.unreadCount ?? 0,
    };
  } catch (err) {
    console.error("Error in getNotifications:", err);
    throw err;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const res = await fetch(`${backend_url}/notification/unread-count`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch unread count.");
    return data.unreadCount ?? 0;
  } catch (err) {
    console.error("Error in getUnreadNotificationCount:", err);
    throw err;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await fetch(`${backend_url}/notification/${notificationId}/read`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to mark notification as read.");
    return data.notification;
  } catch (err) {
    console.error("Error in markNotificationAsRead:", err);
    throw err;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const res = await fetch(`${backend_url}/notification/mark-all-read`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to mark all notifications as read.");
    return data;
  } catch (err) {
    console.error("Error in markAllNotificationsAsRead:", err);
    throw err;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const res = await fetch(`${backend_url}/notification/${notificationId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete notification.");
    return true;
  } catch (err) {
    console.error("Error in deleteNotification:", err);
    throw err;
  }
};