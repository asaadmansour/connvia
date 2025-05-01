import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated, getUserRole } from "../utils/authService";
import Spinner from "./Spinner";

/**
 * A protected route component that checks both authentication and user role
 * @param {Object} props - Component props
 * @param {string} props.allowedRole - The role allowed to access this route
 * @returns {JSX.Element} - The protected route component
 */
function RoleProtectedRoute({ allowedRole }) {
  const [authStatus, setAuthStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const role = getUserRole();
      
      setAuthStatus(authenticated);
      setUserRole(role);
    };
    checkAuth();
  }, []);

  if (authStatus === null || userRole === null) {
    return <Spinner />;
  }

  // If user is not authenticated, redirect to login
  if (!authStatus) {
    return <Navigate to="/login" />;
  }

  // If user is authenticated but doesn't have the correct role, redirect to their appropriate dashboard
  if (userRole !== allowedRole) {
    // Determine the correct dashboard based on user role
    let redirectPath;
    switch(userRole) {
      case 'organizer':
        redirectPath = "/dashboards/organizer";
        break;
      case 'vendor':
        redirectPath = "/dashboards/vendor";
        break;
      case 'venue':
        redirectPath = "/dashboards/venue";
        break;
      case 'regular':
      default:
        redirectPath = "/dashboards/attendee";
        break;
    }
    
    return <Navigate to={redirectPath} />;
  }

  // User is authenticated and has the correct role
  return <Outlet />;
}

export default RoleProtectedRoute;
