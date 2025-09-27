// Event service for handling events
import { getToken } from "./authService";

const API_URL = "https://connviabackend-production.up.railway.app/api/events";

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const createEvent = async (eventData) => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    // Create a simple JSON object with all event data
    const jsonData = {
      name: eventData.title,
      description: eventData.description,
      price: parseFloat(eventData.ticketPrice),
      capacity: parseInt(eventData.capacity),
      date: eventData.eventDate,
      duration: eventData.eventTime,
      reservation_ID: eventData.reservation_ID,
      venue_ID: eventData.venue_ID,
      category_name: eventData.category_name || "General",
      subcategory_id: eventData.subcategory_id || null,
      venue_name: eventData.venue_name || "",
      // Pass the base64 image data directly
      image: eventData.image || null,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create event",
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while creating the event",
    };
  }
};

/**
 * Get events for the authenticated organizer
 * @returns {Promise<Object>} - Response with success status and data or error
 */
/**
 * Get all events for attendees
 * @param {Object} filters - Optional filters (category, search)
 * @returns {Promise<Object>} - Response with success status and data or error
 */
/**
 * Get all categories and subcategories
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch categories",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
};

export const getAllEvents = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.search) queryParams.append("search", filters.search);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await fetch(`${API_URL}/all${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch events",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
};

export const getOrganizerEvents = async () => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    const response = await fetch(`${API_URL}/organizer`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch events",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    return {
      success: false,
      error:
        error.message || "An unexpected error occurred while fetching events",
    };
  }
};
