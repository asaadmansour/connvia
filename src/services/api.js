import axios from "axios";

// Error handling helper
const handleApiError = (error) => {
  if (error.response) {
    return error.response.data;
  }
  return {
    success: false,
    error: "Network error occurred",
  };
};

// Payment API functions
export const createPaymentIntent = async (reservationId) => {
  try {
    const response = await axios.post(
      `/api/payment/reservation/${reservationId}/create-intent`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const confirmPayment = async (reservationId, paymentIntentId) => {
  try {
    const response = await axios.post(
      `/api/payment/reservation/${reservationId}/confirm`,
      {
        paymentIntentId,
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createCheckoutSession = async (venueData) => {
  try {
    const response = await axios.post(
      "https://connviabackend-production.up.railway.app/api/stripe/create-session",
      venueData
    );
    return response.data;
  } catch (error) {
    console.error("Checkout session error:", error);
    return { success: false, error: error.message };
  }
};
