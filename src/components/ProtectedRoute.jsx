import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated, getToken } from "../utils/authService";
import Spinner from "./Spinner";

function ProtectedRoute() {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setAuthStatus(authenticated);
    };
    checkAuth();
  }, []);

  if (authStatus === null) {
    return <Spinner />;
  }

  return authStatus ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
