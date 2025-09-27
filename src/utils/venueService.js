// Venue service for handling venue operations
import { getToken } from "./authService";

// Use the correct API endpoint that we just implemented
const API_URL = "https://connviabackend-production.up.railway.app/api/venues";

/**
 * Add a new venue
 * @param {Object} venueData - Venue data
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const addVenue = async (venueData) => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add venue details to formData
    formData.append("name", venueData.name);
    formData.append("location", JSON.stringify(venueData.location));
    formData.append("capacity", venueData.capacity);

    // Convert amenities object to a facilities string
    const facilitiesArray = [];
    for (const [amenity, enabled] of Object.entries(venueData.amenities)) {
      if (enabled === true) {
        facilitiesArray.push(amenity);
      }
    }
    formData.append("facilities", JSON.stringify(facilitiesArray));

    formData.append("available_dates", venueData.available_dates);

    // Handle images
    if (venueData.images && venueData.images.length > 0) {
      venueData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    formData.append("is_available", 1); // Default to available
    formData.append("availability_info", venueData.available_dates);
    formData.append("description", venueData.description);
    formData.append("category", venueData.category);

    // Convert rules object to a rules string
    const rulesArray = [];
    for (const [rule, enabled] of Object.entries(venueData.rules)) {
      if (enabled === true) {
        rulesArray.push(rule);
      }
    }
    if (venueData.otherRules) {
      rulesArray.push(venueData.otherRules);
    }
    formData.append("rules", JSON.stringify(rulesArray));

    formData.append("contact_email", venueData.contact_email);

    // Handle pricing
    formData.append("pricing_type", venueData.pricingType);
    if (
      venueData.pricingType === "hourly" ||
      venueData.pricingType === "both"
    ) {
      formData.append("cost_hourly", venueData.hourlyRate);
    }

    if (venueData.pricingType === "daily" || venueData.pricingType === "both") {
      formData.append("cost_daily", venueData.dailyRate);
    }

    // If gates information is available, add it to working_hours
    const workingHoursData = {
      gates: venueData.gates,
    };
    formData.append("working_hours", JSON.stringify(workingHoursData));

    console.log("Submitting venue to endpoint:", API_URL);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type when using FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Venue API error:", data);
      // Log the full response for debugging
      console.log("Full response status:", response.status);
      console.log(
        "Full response headers:",
        Object.fromEntries([...response.headers.entries()])
      );

      // Return detailed error information
      return {
        success: false,
        error: data.error || data.message || "Failed to add venue",
        details: data.details || null,
        code: data.code || null,
        sqlState: data.sqlState || null,
        status: response.status,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Add venue error:", error);
    return {
      success: false,
      error:
        error.message || "An unexpected error occurred while adding the venue",
    };
  }
};

/**
 * Get venues for the current user
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const getMyVenues = async () => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Venue API error:", data);
      return {
        success: false,
        error: data.error || data.message || "Failed to fetch venues",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching venues:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * Get detailed information about a specific venue
 * @param {string} venueId - The ID of the venue to fetch details for
 * @returns {Promise<Object>} - Response with success status and venue details or error
 */
export const getVenueDetails = async (venueId) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/details/${venueId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Venue details API error:", data);
      return {
        success: false,
        error: data.error || data.message || "Failed to get venue details",
      };
    }

    return {
      success: true,
      data: data.venue || data,
    };
  } catch (error) {
    console.error("Error fetching venue details:", error);
    return {
      success: false,
      error: "Failed to fetch venue details. Please try again later.",
    };
  }
};

/**
 * Update an existing venue
 * @param {string} venueId - ID of the venue to update
 * @param {Object} venueData - Updated venue data
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const updateVenue = async (venueId, venueData) => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add venue details to formData
    formData.append("name", venueData.name);

    // Handle location data properly to prevent double stringification
    let locationData = venueData.location || {};

    // If location is already a string, parse it first to avoid double stringification
    if (typeof locationData === "string") {
      try {
        locationData = JSON.parse(locationData);
      } catch (e) {
        console.error("Error parsing location string:", e);
      }
    }

    formData.append("location", JSON.stringify(locationData));
    formData.append("capacity", venueData.capacity);

    // Convert amenities object to a facilities string
    const facilitiesArray = [];
    if (venueData.amenities) {
      for (const [amenity, enabled] of Object.entries(venueData.amenities)) {
        if (enabled === true) {
          facilitiesArray.push(amenity);
        }
      }
    }
    formData.append("facilities", JSON.stringify(facilitiesArray));

    formData.append("available_dates", venueData.available_dates || "");

    // Handle images
    if (venueData.newImages && venueData.newImages.length > 0) {
      venueData.newImages.forEach((image) => {
        formData.append("images", image);
      });
    }

    // Handle existing images
    if (venueData.images) {
      if (typeof venueData.images === "string") {
        formData.append("existingImages", venueData.images);
      } else if (Array.isArray(venueData.images)) {
        venueData.images.forEach((image) => {
          formData.append("existingImages", image);
        });
      }
    }

    formData.append(
      "is_available",
      venueData.is_available !== undefined ? venueData.is_available : 1
    );
    formData.append(
      "availability_info",
      venueData.availability_info || venueData.available_dates || ""
    );
    formData.append("description", venueData.description);
    formData.append("category", venueData.category);

    // Convert rules object to a rules string
    const rulesArray = [];
    if (venueData.rules) {
      for (const [rule, enabled] of Object.entries(venueData.rules)) {
        if (enabled === true) {
          rulesArray.push(rule);
        }
      }
    }
    formData.append("rules", JSON.stringify(rulesArray));

    formData.append("contact_email", venueData.contact_email);

    // Handle pricing
    formData.append("pricing_type", venueData.pricing_type);
    if (
      venueData.pricing_type === "hourly" ||
      venueData.pricing_type === "both"
    ) {
      formData.append("cost_hourly", venueData.cost_hourly);
    }

    if (
      venueData.pricing_type === "daily" ||
      venueData.pricing_type === "both"
    ) {
      formData.append("cost_daily", venueData.cost_daily);
    }

    // If working_hours information is available
    if (venueData.working_hours) {
      formData.append(
        "working_hours",
        typeof venueData.working_hours === "string"
          ? venueData.working_hours
          : JSON.stringify(venueData.working_hours)
      );
    }

    console.log("Updating venue at endpoint:", `${API_URL}/${venueId}`);

    const response = await fetch(`${API_URL}/${venueId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type when using FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Venue update API error:", data);
      return {
        success: false,
        error: data.error || data.message || "Failed to update venue",
      };
    }

    return {
      success: true,
      message: data.message || "Venue updated successfully",
      venueId: data.venueId,
    };
  } catch (error) {
    console.error("Error updating venue:", error);
    return {
      success: false,
      error: "Failed to update venue. Please try again later.",
    };
  }
};

/**
 * Get all available venues
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const getAvailableVenues = async () => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(`${API_URL}/available`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Get available venues API error:", data);
      return {
        success: false,
        error: data.error || "Failed to get available venues",
      };
    }

    // Direct inspection and processing of the venue data
    if (data && data.venues && Array.isArray(data.venues)) {
      console.log(
        "VENUESERVICE - Raw API venues data:",
        JSON.stringify(data.venues, null, 2)
      );

      // Make sure ownerName is preserved
      data.venues = data.venues.map((venue) => {
        console.log(
          `VENUESERVICE - Processing venue ${venue.id}, owner name:`,
          venue.ownerName
        );

        // Enforce owner name if it exists in the data
        if (venue.ownerName) {
          console.log(
            `VENUESERVICE - Preserving owner name: ${venue.ownerName}`
          );
          return {
            ...venue,
            ownerName: venue.ownerName, // Explicitly preserve this
          };
        }
        return venue;
      });

      console.log(
        "VENUESERVICE - Processed venues data:",
        JSON.stringify(data.venues, null, 2)
      );
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get available venues error:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while fetching available venues",
    };
  }
};

/**
 * Get venue owner details by ID
 * @param {number} ownerId - The ID of the venue owner
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const getVenueOwnerById = async (ownerId) => {
  try {
    console.log("Fetching venue owner details for ID:", ownerId);
    const token = getToken();

    if (!token) {
      console.error("No token available for getVenueOwnerById");
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Log the API URL being called
    const apiUrl = `${API_URL}/api/venues/owner/${ownerId}`;
    console.log("Calling API endpoint:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API response status:", response.status);
    const data = await response.json();
    console.log("API response data:", data);

    if (!response.ok) {
      console.error("Get venue owner API error:", data);
      return {
        success: false,
        error: data.error || "Failed to get venue owner details",
      };
    }

    console.log("Successfully fetched venue owner data:", data);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get venue owner error:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while fetching venue owner details",
    };
  }
};

/**
 * Reserve a venue (mark it as unavailable)
 * @param {number} venueId - The ID of the venue to reserve
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const reserveVenue = async (venueId) => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    console.log(`Reserving venue with ID: ${venueId}`);

    const response = await fetch(`${API_URL}/${venueId}/reserve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Reserve venue API error:", data);
      return {
        success: false,
        error: data.error || "Failed to reserve venue",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Reserve venue error:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while reserving the venue",
    };
  }
};

/**
 * Delete a venue
 * @param {string} venueId - ID of the venue to delete
 * @returns {Promise<Object>} - Response with success status and message or error
 */
export const deleteVenue = async (venueId) => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    console.log(`Deleting venue with ID: ${venueId}`);

    const response = await fetch(`${API_URL}/${venueId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Delete venue response data:", data);

    if (!response.ok) {
      console.error("Delete venue API error:", data);

      // Check if the error is related to foreign key constraint
      if (data.details && data.details.includes("foreign key constraint")) {
        return {
          success: false,
          error: "Cannot delete venue because it's currently reserved",
          details: data.details || "",
        };
      }

      return {
        success: false,
        error: data.error || data.message || "Failed to delete venue",
        details: data.details || "",
      };
    }

    return {
      success: true,
      message: data.message || "Venue deleted successfully",
    };
  } catch (error) {
    console.error("Delete venue error:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while deleting the venue",
      details: error.sqlMessage || error.details || "",
    };
  }
};
