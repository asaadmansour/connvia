const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3007";

export const loginUser = async (email, password, recaptchaToken) => {
  try {
    clearAuthData(); // Always clear old data before login

    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for session-based auth
      body: JSON.stringify({ email, password, recaptchaToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.requireRecaptcha) {
        return {
          error: data.error || "Login failed",
          requireRecaptcha: true,
        };
      }
      throw new Error(data.error || "Login failed");
    }

    if (data.token) {
      setAuthData(data.token); // Save token properly
    }

    return data;
  } catch (error) {
    clearAuthData();
    throw new Error(error.message || "An error occurred during login");
  }
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const expiresAt = localStorage.getItem("tokenExpiresAt");

    if (!token || !expiresAt) {
      clearAuthData();
      return false;
    }

    if (Date.now() > parseInt(expiresAt)) {
      clearAuthData();
      return false;
    }

    const response = await fetch(`${API_URL}/api/verify-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (response.status === 401) {
      clearAuthData();
      return false;
    }

    const data = await response.json();
    return response.ok && data.isValid;
  } catch (error) {
    console.error("Token verification failed:", error);
    clearAuthData();
    return false;
  }
};

export const logout = async () => {
  const token = localStorage.getItem("authToken");
  clearAuthData(); // Always clear tokens first

  if (token) {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  window.location.href = "/login"; // Force logout
};

// ✅ FIX: Ensure expiration is stored properly
const setAuthData = (token) => {
  clearAuthData();
  localStorage.setItem("authToken", token);
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem("tokenExpiresAt", expiresAt.toString());
};

const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenExpiresAt");
};
