import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Homepage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Login from "./pages/Login";
import Spinner from "./components/Spinner";
import Dashboard from "./pages/Dashboard";
import AttendeeDashboard from "./pages/dashboards/AttendeeDashboard";
import OrganizerDashboard from "./pages/dashboards/OrganizerDashboard";
import VendorDashboard from "./pages/dashboards/VendorDashboard";
import VenueDashboard from "./pages/dashboards/VenueDashboard";
import { isAuthenticated } from "./utils/authService";
import "./utils/i18n";
import Signup from "./pages/Signup";
import Events from "./pages/Events";
import VerifyEmail from "./pages/VerifyEmail";
import AccountDetails from "./components/AccountDetails";

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const isValid = isAuthenticated();
        setAuthState({
          isAuthenticated: isValid,
          isLoading: false,
        });
      } catch {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  if (authState.isLoading) {
    return <Spinner fullScreen size="large" />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/account" element={<AccountDetails />} />
    
        {/* Protecting Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
        </Route>

        {/* Role-specific dashboards */}
        <Route path="/dashboards/attendee" element={<RoleProtectedRoute allowedRole="regular" />}>
          <Route index element={<AttendeeDashboard />} />
        </Route>
        <Route path="/dashboards/organizer" element={<RoleProtectedRoute allowedRole="organizer" />}>
          <Route index element={<OrganizerDashboard />} />
        </Route>
        <Route path="/dashboards/vendor" element={<RoleProtectedRoute allowedRole="vendor" />}>
          <Route index element={<VendorDashboard />} />
        </Route>
        <Route path="/dashboards/venue" element={<RoleProtectedRoute allowedRole="venue" />}>
          <Route index element={<VenueDashboard />} />
        </Route>

        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
