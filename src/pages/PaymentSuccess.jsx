import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUpdating, setIsUpdating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const reservationId = searchParams.get("reservation_id");

    const updatePaymentStatus = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("No authentication token found");
        }

        // Update the payment status to 'paid'
        await axios.patch(
          `https://connviabackend-production.up.railway.app/api/reservations/${reservationId}/payment`,
          { paymentStatus: "paid" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setIsUpdating(false);

        // Redirect to reservations page after 3 seconds
        setTimeout(() => {
          navigate("/reservations");
        }, 3000);
      } catch (err) {
        console.error("Error updating payment status:", err);
        setError("Failed to update payment status. Please contact support.");
        setIsUpdating(false);
      }
    };

    if (reservationId) {
      updatePaymentStatus();
    } else {
      setError("No reservation ID found");
      setIsUpdating(false);
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {isUpdating ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing your payment...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for your reservation. You will be redirected to your
              reservations page shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
