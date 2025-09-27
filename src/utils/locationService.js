import axios from "axios";

const API_URL =
  "https://connviabackend-production.up.railway.app/api/locations";

/**
 * Fetch all governorates from the API
 */
export const getGovernorates = async () => {
  try {
    const response = await axios.get(`${API_URL}/governorates`);

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch governorates",
      };
    }
  } catch (error) {
    console.error("Error fetching governorates:", error);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "An error occurred while fetching governorates",
    };
  }
};

/**
 * Fetch districts by governorate ID
 */
export const getDistrictsByGovernorate = async (governorateId) => {
  try {
    const response = await axios.get(`${API_URL}/districts/${governorateId}`);

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch districts",
      };
    }
  } catch (error) {
    console.error("Error fetching districts:", error);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "An error occurred while fetching districts",
    };
  }
};

/**
 * Fetch all locations (governorates with districts) from the API
 */
export const getAllLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch locations",
      };
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "An error occurred while fetching locations",
    };
  }
};
