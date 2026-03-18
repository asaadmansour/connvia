// dashboardService.js
import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://connviabackend-production.up.railway.app/api";

// Get venue owner dashboard statistics
export const getVenueOwnerStats = async () => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Use the venue controller endpoint
    const response = await axios.get(`${API_URL}/venues/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.stats,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch dashboard data",
      };
    }
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to fetch dashboard statistics",
    };
  }
};

// Get organizer dashboard statistics
export const getOrganizerStats = async () => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await axios.get(`${API_URL}/dashboard/organizer-stats`, {
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
        error: response.data?.error || "Failed to fetch dashboard data",
      };
    }
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to fetch dashboard statistics",
    };
  }
};
