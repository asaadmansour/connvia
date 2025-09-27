// notificationService.js
import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://connviabackend-production.up.railway.app/api";

/**
 * Get notifications for the authenticated user
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const getUserNotifications = async () => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch notifications",
      };
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch notifications",
    };
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId - ID of the notification to mark as read
 * @returns {Promise<Object>} - Response with success status and message or error
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to mark notification as read",
      };
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to mark notification as read",
    };
  }
};

/**
 * Mark all notifications as read for the authenticated user
 * @returns {Promise<Object>} - Response with success status and message or error
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await axios.patch(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        message: response.data.message,
        count: response.data.count,
      };
    } else {
      return {
        success: false,
        error:
          response.data?.error || "Failed to mark all notifications as read",
      };
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to mark all notifications as read",
    };
  }
};

/**
 * Create a notification (for testing purposes)
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Response with success status and message or error
 */
export const createNotification = async (notificationData) => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await axios.post(
      `${API_URL}/notifications`,
      notificationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        message: response.data.message,
        notificationId: response.data.notificationId,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to create notification",
      };
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to create notification",
    };
  }
};
