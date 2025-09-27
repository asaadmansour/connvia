// Authentication service for handling user authentication
const API_BASE_URL =
  "https://connviabackend-production.up.railway.app/api/auth";

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const registerUser = async (userData) => {
  try {
    // The userData object is already properly formatted in the Signup component
    // We'll just send it directly to the API

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Registration failed",
        emailSent: data.emailSent || false,
      };
    }

    return {
      success: true,
      data,
      emailSent: data.emailSent || false,
      verificationToken: data.verificationToken,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error:
        error.message || "An unexpected error occurred during registration",
    };
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} recaptchaToken - reCAPTCHA token
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const loginUser = async (email, password, recaptchaToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        recaptchaToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Login failed",
      };
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);

      // Decode and log the JWT token to see what information it contains
      try {
        const tokenParts = data.token.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Decoded JWT payload:", payload);

          // If the token contains user type information, store it
          if (payload.userType) {
            localStorage.setItem("userRole", payload.userType);
          } else if (payload.user_type) {
            localStorage.setItem("userRole", payload.user_type);
          } else if (payload.role) {
            localStorage.setItem("userRole", payload.role);
          }
        }
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }

      // Store user role if available in the response
      if (data.user && data.user.userType) {
        localStorage.setItem("userRole", data.user.userType);
      } else if (data.user && data.user.user_type) {
        localStorage.setItem("userRole", data.user.user_type);
      }

      // Calculate token expiry (if needed)
      if (data.expiresIn) {
        const expiresAt = new Date().getTime() + data.expiresIn * 1000;
        localStorage.setItem("tokenExpiresAt", expiresAt.toString());
      }
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during login",
    };
  }
};

/**
 * Logout user
 * @returns {void}
 */
export const logoutUser = () => {
  // Remove token from localStorage
  localStorage.removeItem("authToken");
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

/**
 * Get current user's token
 * @returns {string|null} - User's token or null if not authenticated
 */
export const getToken = () => {
  const token = localStorage.getItem("authToken");
  console.log(
    "Retrieved token from storage:",
    token ? `${token.substring(0, 10)}...` : "null"
  );
  return token;
};

/**
 * Get current user's role
 * @returns {string|null} - User's role or null if not available
 */
export const getUserRole = () => {
  return localStorage.getItem("userRole");
};

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const verifyEmail = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-email/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Email verification failed",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred during email verification",
    };
  }
};

/**
 * Request password reset
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Password reset request failed",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred during password reset request",
    };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Response with success status and data or error
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Password reset failed",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error:
        error.message || "An unexpected error occurred during password reset",
    };
  }
};
