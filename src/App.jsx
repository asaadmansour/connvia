import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Homepage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Spinner from "./components/Spinner";
import Dashboard from "./pages/Dashboard";
import { isAuthenticated } from "./utils/authService";
import "./utils/i18n";
import Signup from "./pages/Signup";
import Events from "./pages/Events";

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
        <Route path="/events" element={<Events />} />

        {/* Protecting Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
        </Route>

        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
