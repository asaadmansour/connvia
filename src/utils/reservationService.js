// Reservation service for handling venue reservations
import { getToken } from "./authService";

const API_URL =
  "https://connviabackend-production.up.railway.app/api/reservations";

/**
 * Create a new venue reservation
 */
/**
 * Create a new venue reservation
 * @param {Object} reservationData - Reservation data for the venue
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const createReservation = async (reservationData) => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reservationData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create reservation",
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while creating the reservation",
    };
  }
};

/**
 * Get reservations for the authenticated organizer
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const getOrganizerReservations = async () => {
  try {
    const token = getToken();

    if (!token) {
      /* log removed */
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    /* log removed */

    const response = await fetch(`${API_URL}/organizer`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      /* log removed */
      return {
        success: false,
        error: data.error || "Failed to fetch reservations",
      };
    }

    /* log removed */

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while fetching reservations",
    };
  }
};

/**
 * Get reservations for the authenticated venue owner
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const getVenueOwnerReservations = async () => {
  try {
    const token = getToken();

    if (!token) {
      /* log removed */
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    /* log removed */

    const response = await fetch(`${API_URL}/venue-owner`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      /* log removed */
      return {
        success: false,
        error: data.error || "Failed to fetch reservations",
      };
    }

    /* log removed */

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while fetching reservations",
    };
  }
};
