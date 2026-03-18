// src/pages/Signup.jsx
import { useState, useRef, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Signup.module.css";
import AuthHeader from "../components/AuthHeader";
import AuthFooter from "../components/AuthFooter";
import InfoSection from "../components/InfoSection";
import Video from "../components/Video";
import { registerUser } from "../utils/authService";

// Import step components
import StepIndicator from "../components/signup/StepIndicator";
import BasicInfoStep from "../components/signup/BasicInfoStep";
import UserTypeStep from "../components/signup/UserTypeStep";
import RoleSpecificStep from "../components/signup/RoleSpecificStep";
import TermsStep from "../components/signup/TermsStep";
import SuccessMessage from "../components/signup/SuccessMessage";

// Form reducer and initial state
const formReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
        touched: {
          ...state.touched,
          [action.field]: true,
        },
      };
    case "UPDATE_ROLE_DATA":
      return {
        ...state,
        roleData: {
          ...state.roleData,
          [action.field]: action.value,
        },
        touched: {
          ...state.touched,
          [`roleData.${action.field}`]: true,
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error,
        },
      };
    case "CLEAR_ERROR": {
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return {
        ...state,
        errors: newErrors,
      };
    }
    case "RESET_FORM":
      return initialFormState;
    default:
      return state;
  }
};

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  gender: "",
  dateOfBirth: "",
  user_type: "",
  termsAccepted: false,
  recaptchaToken: "",
  roleData: {},
  touched: {},
  errors: {},
};

function Signup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [passwordStrength, setPasswordStrength] = useState("weak");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Validation functions
  const validateStep = (step) => {
    let isValid = true;
    const errors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formState.name.trim()) {
          errors.name = "Name is required";
          isValid = false;
        }

        if (!formState.email.trim()) {
          errors.email = "Email is required";
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
          errors.email = "Email is invalid";
          isValid = false;
        }

        if (!formState.password) {
          errors.password = "Password is required";
          isValid = false;
        } else if (formState.password.length < 8) {
          errors.password = "Password must be at least 8 characters";
          isValid = false;
        } else if (passwordStrength === "weak") {
          errors.password = "Password is too weak";
          isValid = false;
        }

        if (!formState.confirmPassword) {
          errors.confirmPassword = "Please confirm your password";
          isValid = false;
        } else if (formState.password !== formState.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
          isValid = false;
        }
        break;

      case 2: // User Type
        if (!formState.user_type) {
          errors.user_type = "Please select a user type";
          isValid = false;
        }
        break;

      case 3: // Role Specific
        if (formState.user_type === "vendor") {
          if (!formState.roleData.vendor_name) {
            errors["roleData.vendor_name"] = "Vendor name is required";
            isValid = false;
          }
          if (!formState.roleData.vendor_type) {
            errors["roleData.vendor_type"] = "Vendor type is required";
            isValid = false;
          }
        } else if (formState.user_type === "organizer") {
          if (!formState.roleData.company_name) {
            errors["roleData.company_name"] = "Company name is required";
            isValid = false;
          }
          if (!formState.roleData.organization_type) {
            errors["roleData.organization_type"] =
              "Organization type is required";
            isValid = false;
          }
        } else if (formState.user_type === "venue") {
          if (!formState.roleData.venue_name) {
            errors["roleData.venue_name"] = "Name is required";
            isValid = false;
          }
          if (!formState.roleData.address) {
            errors["roleData.address"] = "Address is required";
            isValid = false;
          }
          if (!formState.roleData.tax_number) {
            errors["roleData.tax_number"] = "Tax number is required";
            isValid = false;
          } else if (
            !/^[A-Za-z0-9]{5,15}$/.test(formState.roleData.tax_number)
          ) {
            errors["roleData.tax_number"] =
              "Tax number must be 5-15 alphanumeric characters";
            isValid = false;
          }
          if (!formState.roleData.working_hours) {
            errors["roleData.working_hours"] = "Working hours are required";
            isValid = false;
          }
          // Custom hours validation
          if (
            formState.roleData.working_hours === "custom" &&
            !formState.roleData.custom_hours
          ) {
            errors["roleData.custom_hours"] =
              "Please specify your custom working hours";
            isValid = false;
          }
        } else if (formState.user_type === "attendee") {
          // Interests is optional but should be validated if provided
          if (
            formState.roleData.interests &&
            formState.roleData.interests.length > 500
          ) {
            errors["roleData.interests"] =
              "Interests should be less than 500 characters";
            isValid = false;
          }

          // Location preferences is optional but should be validated if provided
          if (
            formState.roleData.locationPreferences &&
            formState.roleData.locationPreferences.length > 500
          ) {
            errors["roleData.locationPreferences"] =
              "Location preferences should be less than 500 characters";
            isValid = false;
          }
        }
        break;

      case 4: // Terms
        if (!formState.termsAccepted) {
          errors.termsAccepted = "You must accept the terms and conditions";
          isValid = false;
        }
        if (!formState.recaptchaToken) {
          errors.recaptchaToken = "Please complete the reCAPTCHA";
          isValid = false;
        }
        break;

      default:
        break;
    }

    // Update errors in state
    Object.keys(errors).forEach((field) => {
      dispatch({ type: "SET_ERROR", field, error: errors[field] });
    });

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    dispatch({
      type: "UPDATE_FIELD",
      field: name,
      value: fieldValue,
    });

    // Clear error when user types
    if (formState.errors[name]) {
      dispatch({ type: "CLEAR_ERROR", field: name });
    }

    // Check password strength
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const handleRoleDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    dispatch({
      type: "UPDATE_ROLE_DATA",
      field: name,
      value: fieldValue,
    });

    // Clear error when user types
    if (formState.errors[`roleData.${name}`]) {
      dispatch({ type: "CLEAR_ERROR", field: `roleData.${name}` });
    }
  };

  const checkPasswordStrength = (password) => {
    // Password strength criteria
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (
      isLongEnough &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    ) {
      setPasswordStrength("strong");
    } else if (
      isLongEnough &&
      (hasUpperCase || hasLowerCase) &&
      (hasNumbers || hasSpecialChar)
    ) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Inside the handleSubmit function
  const handleSubmit = async () => {
    // e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Map user_type to database values
      const userTypeMapping = {
        attendee: "regular",
        organizer: "eventCreator",
        vendor: "vendor",
        venue: "venueOwner",
      };

      // Create role-specific data based on user type
      let roleSpecificData = {};
      if (formState.user_type === "vendor") {
        roleSpecificData = {
          businessName: formState.roleData?.vendor_name || "",
          businessType: formState.roleData?.vendor_type || "",
          website: formState.roleData?.website || "",
        };
      } else if (formState.user_type === "organizer") {
        roleSpecificData = {
          businessName: formState.roleData?.company_name || "",
          organizationType: formState.roleData?.organization_type || "",
          organizerDesc: formState.roleData?.organizer_desc || "",
        };
      } else if (formState.user_type === "venue") {
        roleSpecificData = {
          venueName: formState.roleData?.venue_name || "",
          location: formState.roleData?.address || "",
          taxNumber: formState.roleData?.tax_number || "",
          workingHours: formState.roleData?.working_hours || "",
          customHours: formState.roleData?.custom_hours || "",
          logo: formState.roleData?.logo || "",
        };
      } else if (formState.user_type === "attendee") {
        roleSpecificData = {
          interests: formState.roleData?.interests || "",
          locationPreferences: formState.roleData?.locationPreferences || "",
          selectedInterests: formState.roleData?.selectedInterests || [],
          selectedLocations: formState.roleData?.selectedLocations || [],
        };
      }

      const userData = {
        name: formState.name,
        email: formState.email,
        password: formState.password,
        phoneNumber: formState.phone || "",
        city: formState.city || "",
        gender: formState.gender || "",
        dateOfBirth: formState.dateOfBirth || "",
        userType: userTypeMapping[formState.user_type] || formState.user_type,
        recaptchaToken: formState.recaptchaToken,
        ...roleSpecificData,
      };

      const response = await registerUser(userData);

      if (response.success) {
        // Registration successful — navigate directly to login
        dispatch({ type: "RESET_FORM" });
        toast.success("Registration successful! You can now log in.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(response.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the appropriate step component based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formState={formState}
            handleChange={handleChange}
            handleNextStep={handleNextStep}
            passwordStrength={passwordStrength}
          />
        );
      case 2:
        return (
          <UserTypeStep
            formState={formState}
            handleChange={handleChange}
            handleNextStep={handleNextStep}
            handlePrevStep={handlePrevStep}
          />
        );
      case 3:
        return (
          <RoleSpecificStep
            formState={formState}
            handleChange={handleChange}
            handleRoleDataChange={handleRoleDataChange}
            handleNextStep={handleNextStep}
            handlePrevStep={handlePrevStep}
          />
        );
      case 4:
        return (
          <TermsStep
            formState={formState}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handlePrevStep={handlePrevStep}
            isSubmitting={isSubmitting}
            recaptchaRef={recaptchaRef}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.signupContainer}>
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
            <h1 className={styles.title}>{t("Create Your Account")}</h1>

            {/* Step indicators */}
            {!isSuccess && (
              <div className={styles.stepIndicator}>
                <StepIndicator currentStep={currentStep} totalSteps={4} />
              </div>
            )}

            {/* Render the current step or success message */}
            {isSuccess ? (
              <div className={styles.successContainer}>
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.successTitle}>
                  Registration Successful!
                </h2>
                <p className={styles.successText}>
                  We've sent a verification email to {formState.email}.<br />
                  Please check your inbox and verify your email to complete the
                  registration.
                </p>
                <button
                  className={styles.nextButton}
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </button>
              </div>
            ) : (
              renderStep()
            )}
          </div>
          <AuthFooter
            linkColor="var(--purple-dark)"
            linkHoverColor="var(--purple-mid)"
          />
        </div>

        <InfoSection />
      </div>
    </div>
  );
}

export default Signup;
