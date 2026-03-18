// src/pages/VerifyEmail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./VerifyEmail.module.css";
import VerifyEmailHeader from "../components/VerifyEmailHeader";
import { verifyEmail } from "../utils/authService"; // Import the authService utility

const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      // Prevent multiple verification attempts
      if (verificationAttempted.current) return;

      try {
        verificationAttempted.current = true;
        // Use the authService utility instead of direct fetch
        const result = await verifyEmail(token);

        if (result.success) {
          setVerificationStatus("success");
          toast.success("Email verified successfully!");
        } else {
          // Special case: if the error contains "already verified" or similar message,
          // treat it as a success
          if (
            result.error &&
            (result.error.includes("already verified") ||
              result.error.includes("already been verified") ||
              result.error.includes("You can now log in"))
          ) {
            setVerificationStatus("success");
            toast.success("Email already verified!");
          } else {
            setVerificationStatus("error");

            // Handle specific error cases
            if (result.error === "Invalid or expired verification token") {
              setErrorMessage(
                "Your verification link is invalid or has expired. Please request a new one."
              );
            } else if (result.error === "Verification token has expired") {
              setErrorMessage(
                "Your verification link has expired. Please request a new one."
              );
            } else {
              setErrorMessage(
                result.error || "Verification failed. Please try again."
              );
            }

            toast.error(result.error || "Verification failed");
          }
        }
      } catch (error) {
        /* log removed */
        setVerificationStatus("error");
        setErrorMessage(
          "An unexpected error occurred. Please try again later."
        );
        toast.error("An error occurred during verification");
      }
    };

    if (token && !verificationAttempted.current) {
      verifyEmailToken();
    } else if (!token) {
      setVerificationStatus("error");
      setErrorMessage("Invalid verification link");
    }
  }, [token]);

  return (
    <div className={styles.verifyEmailContainer}>
      <VerifyEmailHeader />
      <div className={styles.verifyEmailCard}>
        <h2>Email Verification</h2>

        {verificationStatus === "verifying" && (
          <div className={styles.verifyingStatus}>
            <div className={styles.spinner}></div>
            <p>Verifying your email...</p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className={styles.successStatus}>
            <div className={styles.successIcon}>✓</div>
            <h3>Email Verified Successfully!</h3>
            <p>
              Your email has been verified. You can now log in to your account.
            </p>
            <Link to="/login" className={styles.loginButton}>
              Log In
            </Link>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className={styles.errorStatus}>
            <div className={styles.errorIcon}>✗</div>
            <h3>Verification Failed</h3>
            <p>{errorMessage}</p>
            <div className={styles.actionButtons}>
              <Link to="/login" className={styles.actionButton}>
                Log In
              </Link>
              <Link to="/signup" className={styles.actionButton}>
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
