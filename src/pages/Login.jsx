import { useReducer, useEffect } from "react";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Video from "../components/Video";
import styles from "./Login.module.css";
import AuthFooter from "../components/AuthFooter";
import AuthHeader from "../components/AuthHeader";
import InfoSection from "../components/InfoSection";

import { loginUser } from "../utils/authService";
import Spinner from "../components/Spinner";

// Reducer function for form state management
const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "TOGGLE_PASSWORD_VISIBILITY":
      return { ...state, showPassword: !state.showPassword };
    default:
      return state;
  }
};

function Login() {
  const [requireRecaptcha, setRequireRecaptcha] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formState, dispatch] = useReducer(formReducer, {
    email: "",
    password: "",
    showPassword: false,
  });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Clear any existing auth data when the Login component mounts
  useEffect(() => {
    // Always clear tokens on login page - this is crucial
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenExpiresAt");
  }, []);

  const togglePasswordVisibility = () => {
    dispatch({ type: "TOGGLE_PASSWORD_VISIBILITY" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    if (isLoggingIn) return;

    if (!formState.email || !formState.password) {
      toast.error("Please enter both email and password", {
        position: "top-center",
      });
      return;
    }

    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification first", {
        position: "top-center",
      });
      return;
    }

    try {
      setIsLoggingIn(true);

      const response = await loginUser(
        formState.email,
        formState.password,
        recaptchaToken
      );

      setIsLoggingIn(false);

      if (response.token) {
        toast.success("🎉 Login successful!", { position: "top-center" });
        navigate("/dashboard");
        return;
      }

      if (response.emailNotVerified) {
        toast.error("Please verify your email before logging in", {
          position: "top-center",
        });
        return;
      }

      if (response.requireRecaptcha) {
        setRequireRecaptcha(true);
        toast.error(
          response.error ||
            "Multiple failed attempts. Please complete the reCAPTCHA.",
          {
            position: "top-center",
          }
        );

        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setRecaptchaToken(null);
        }
        return;
      }

      if (response.failed) {
        toast.error(response.error || "Login failed. Please try again.", {
          position: "top-center",
        });
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setRecaptchaToken(null);
        }
        return;
      }
    } catch (error) {
      setIsLoggingIn(false);
      toast.error(error.message || "An error occurred during login", {
        position: "top-center",
      });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{ backgroundColor: "#222", color: "#fff" }}
      />

      <div className={styles.content}>
        <div className={styles.formSection}>
          <AuthHeader />
          <Video overlay={0.9} />
          <div className={styles.formContent}>
            <h1 className={styles.title}>{t("signIn")}</h1>

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <div className={styles.floatingInputWrapper}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input
                    type="email"
                    id="email"
                    className={styles.floatingInput}
                    value={formState.email}
                    placeholder=""
                    onChange={(e) =>
                      dispatch({
                        type: "SET_EMAIL",
                        payload: e.target.value,
                      })
                    }
                    required
                  />
                  <label
                    htmlFor="email"
                    className={`${styles.floatingLabel} ${
                      formState.email ? styles.hasContent : ""
                    }`}
                  >
                    {t("email")}
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.floatingInputWrapper}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type={formState.showPassword ? "text" : "password"}
                    id="password"
                    className={styles.floatingInput}
                    value={formState.password}
                    placeholder=""
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PASSWORD",
                        payload: e.target.value,
                      })
                    }
                    required
                  />
                  <label
                    htmlFor="password"
                    className={`${styles.floatingLabel} ${
                      formState.password ? styles.hasContent : ""
                    }`}
                  >
                    {t("password")}
                  </label>
                  <button
                    type="button"
                    className={styles.showPasswordBtn}
                    onClick={togglePasswordVisibility}
                    aria-label={
                      formState.showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {formState.showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className={styles.recaptchaContainer}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => {
                    setRecaptchaToken(token);
                    console.log("reCAPTCHA Token:", token);
                  }}
                  onExpired={() => {
                    setRecaptchaToken(null);
                    console.log("reCAPTCHA expired.");
                  }}
                />
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={isLoggingIn || (requireRecaptcha && !recaptchaToken)}
              >
                {isLoggingIn ? <Spinner /> : t("logIn")}
              </button>
            </form>
            <div className={styles.buttonContainer}>
              <div className={styles.forgotPassword}>
                <Link to="/forgot-password">{t("forgotPassword")}</Link>
              </div>
              <div className={styles.signupSection}>
                <span>{t("dontHaveAccount")} </span>
                <Link to="/signup" className={styles.signupLink}>
                  {t("signup")}
                </Link>
              </div>
            </div>
          </div>

          <AuthFooter />
        </div>

        <InfoSection />
      </div>
    </div>
  );
}

export default Login;
