import { useReducer } from "react";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Video from "../components/Video";
import styles from "./Signup.module.css"; // Using Signup's own CSS module
import AuthFooter from "../components/AuthFooter";
import AuthHeader from "../components/AuthHeader";
import InfoSection from "../components/InfoSection";

// Reducer function for form state management
const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_CONFIRM_PASSWORD":
      return { ...state, confirmPassword: action.payload };
    case "TOGGLE_PASSWORD_VISIBILITY":
      return { ...state, showPassword: !state.showPassword };
    default:
      return state;
  }
};

function Signup() {
  const [requireRecaptcha] = useState(true); // Removed unused setter
  const recaptchaRef = useRef(null);
  const { t } = useTranslation();
  const [formState, dispatch] = useReducer(formReducer, {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
  });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isRegistering] = useState(false); // Removed unused setter

  const togglePasswordVisibility = () => {
    dispatch({ type: "TOGGLE_PASSWORD_VISIBILITY" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();

    // Form validation - just UI feedback
    if (
      !formState.name ||
      !formState.email ||
      !formState.password ||
      !formState.confirmPassword
    ) {
      toast.error("All fields are required", {
        position: "top-center",
      });
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      toast.error("Passwords do not match", {
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

    // Logic will be implemented by you
    toast.info("Sign up logic to be implemented", {
      position: "top-center",
    });
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

      <Video />

      <div className={styles.content}>
        <div className={styles.formSection}>
          <AuthHeader />

          <div className={styles.formContent}>
            <h1 className={styles.title}>{t("signUp")}</h1>

            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className={styles.inputGroup}>
                <div className={styles.floatingInputWrapper}>
                  <span className={styles.inputIcon}>👤</span>
                  <input
                    type="text"
                    id="name"
                    className={styles.floatingInput}
                    value={formState.name}
                    placeholder=""
                    onChange={(e) =>
                      dispatch({
                        type: "SET_NAME",
                        payload: e.target.value,
                      })
                    }
                    required
                  />
                  <label
                    htmlFor="name"
                    className={`${styles.floatingLabel} ${
                      formState.name ? styles.hasContent : ""
                    }`}
                  >
                    {t("name")}
                  </label>
                </div>
              </div>

              {/* Email Field */}
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

              {/* Password Field */}
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

              {/* Confirm Password Field */}
              <div className={styles.inputGroup}>
                <div className={styles.floatingInputWrapper}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type={formState.showPassword ? "text" : "password"}
                    id="confirmPassword"
                    className={styles.floatingInput}
                    value={formState.confirmPassword}
                    placeholder=""
                    onChange={(e) =>
                      dispatch({
                        type: "SET_CONFIRM_PASSWORD",
                        payload: e.target.value,
                      })
                    }
                    required
                  />
                  <label
                    htmlFor="confirmPassword"
                    className={`${styles.floatingLabel} ${
                      formState.confirmPassword ? styles.hasContent : ""
                    }`}
                  >
                    {t("confirmPassword")}
                  </label>
                </div>
              </div>

              <div className={styles.recaptchaContainer}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => {
                    setRecaptchaToken(token);
                  }}
                  onExpired={() => {
                    setRecaptchaToken(null);
                  }}
                />
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={
                  isRegistering || (requireRecaptcha && !recaptchaToken)
                }
              >
                {isRegistering ? "Creating Account..." : t("signUp")}
              </button>
            </form>

            <div className={styles.buttonContainer}>
              <div className={styles.signupSection}>
                <span>{t("alreadyHaveAccount")} </span>
                <Link to="/login" className={styles.signupLink}>
                  {t("logIn")}
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

export default Signup;
