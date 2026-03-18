import axios from "axios";

const API_URL = "https://connviabackend-production.up.railway.app/api/category";

/**
 * Fetch all categories from the API
 */
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch categories",
      };
    }
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "An error occurred while fetching categories",
    };
  }
};

/**
 * Fetch subcategories by category ID
 */
export const getSubcategoriesByCategoryId = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/subcategories/${categoryId}`);

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch subcategories",
      };
    }
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "An error occurred while fetching subcategories",
    };
  }
};

/**
 * Fetch all subcategories from the API
 */
export const getAllSubcategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/subcategories`);

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch all subcategories",
      };
    }
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "An error occurred while fetching all subcategories",
    };
  }
};
