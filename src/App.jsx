import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//pages
// Pages
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Events from "./pages/Events";
import About from "./pages/About";
import Company from "./pages/Company";
import Dashboard from "./pages/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Notifications from "./pages/Notifications";

// Dashboards
import AttendeeDashboard from "./pages/dashboards/AttendeeDashboard";
import OrganizerDashboard from "./pages/dashboards/OrganizerDashboard";
import VendorDashboard from "./pages/dashboards/VendorDashboard";
import VenueDashboard from "./pages/dashboards/VenueDashboard";

// Components
import AccountDetails from "./components/AccountDetails";

// Utils
import { isAuthenticated } from "./utils/authService";
import "./utils/i18n";

// Auth check wrapper component
const AuthWrapper = ({ children }) => {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState("regular");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status on every location change
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole") || "regular";

    console.log(
      "Auth check - Token:",
      token ? "exists" : "none",
      "Role:",
      role
    );

    setIsAuth(!!token);
    setUserRole(role);
    setIsLoading(false);
  }, [location]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return children({ isAuthenticated: isAuth, userRole: userRole });
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AuthWrapper>
        {({ isAuthenticated, userRole }) => (
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  userRole === "organizer" ? (
                    <Navigate to="/dashboards/organizer" replace />
                  ) : userRole === "vendor" ? (
                    <Navigate to="/dashboards/vendor" replace />
                  ) : userRole === "venue" ? (
                    <Navigate to="/dashboards/venue" replace />
                  ) : (
                    <Navigate to="/dashboards/attendee" replace />
                  )
                ) : (
                  <HomePage />
                )
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  userRole === "organizer" ? (
                    <Navigate to="/dashboards/organizer" replace />
                  ) : userRole === "vendor" ? (
                    <Navigate to="/dashboards/vendor" replace />
                  ) : userRole === "venue" ? (
                    <Navigate to="/dashboards/venue" replace />
                  ) : (
                    <Navigate to="/dashboards/attendee" replace />
                  )
                ) : (
                  <Login />
                )
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
            <Route path="/company" element={<Company />} />

            {/* Payment routes */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/account"
              element={
                isAuthenticated ? (
                  <AccountDetails />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/notifications"
              element={
                isAuthenticated ? (
                  <Notifications />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboards/attendee"
              element={
                isAuthenticated ? (
                  <AttendeeDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboards/organizer"
              element={
                isAuthenticated ? (
                  <OrganizerDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboards/vendor"
              element={
                isAuthenticated ? (
                  <VendorDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboards/venue"
              element={
                isAuthenticated ? (
                  <VenueDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        )}
      </AuthWrapper>
    </Router>
  );
}

export default App;
