// src/components/signup/BasicInfoStep.jsx
import { PropTypes } from 'prop-types'; 
import { useState, useEffect } from 'react';
import styles from '../../pages/Signup.module.css';

const BasicInfoStep = ({ formState, handleChange, handleNextStep, passwordStrength }) => {
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Check if both password fields have values
    if (formState.password && formState.confirmPassword) {
      setPasswordMatch(formState.password === formState.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formState.password, formState.confirmPassword]);

  const handleInputChange = (e) => {
    handleChange(e);
    
    // Clear validation error when field is changed
    if (validationErrors[e.target.name]) {
      const newErrors = {...validationErrors};
      delete newErrors[e.target.name];
      setValidationErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formState.name?.trim()) errors.name = "Name is required";
    if (!formState.email?.trim()) errors.email = "Email is required";
    if (!formState.password) errors.password = "Password is required";
    if (!formState.confirmPassword) errors.confirmPassword = "Please confirm your password";
    if (!formState.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formState.phone) errors.phone = "Phone number is required";
    if (!formState.city) errors.city = "City is required";
    if (!formState.gender) errors.gender = "Gender is required";
    
    // Email format validation
    if (formState.email && !/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = "Invalid email format";
    }
    
    // Password validation
    if (formState.password && formState.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    // Password confirmation validation
    if (formState.password && formState.confirmPassword && formState.password !== formState.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      handleNextStep();
    }
  };

  return (
    <>
      <div className={styles.formScrollContainer}>
        <form onSubmit={(e) => { e.preventDefault(); }}>
          {/* Name field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${validationErrors.name ? styles.error : ""}`}>
              <span className={styles.inputIcon}>👤</span>
              <input
                type="text"
                id="name"
                name="name"
                className={styles.floatingInput}
                value={formState.name || ''}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              <label
                htmlFor="name"
                className={`${styles.floatingLabel} ${formState.name ? styles.hasContent : ""}`}
              >
                Full Name 
              </label>
            </div>
            {validationErrors.name && (
              <div className={styles.errorMessage}>{validationErrors.name}</div>
            )}
          </div>

          {/* Email field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${validationErrors.email ? styles.error : ""}`}>
              <span className={styles.inputIcon}>✉️</span>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.floatingInput}
                value={formState.email || ''}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              <label
                htmlFor="email"
                className={`${styles.floatingLabel} ${formState.email ? styles.hasContent : ""}`}
              >
                Email Address 
              </label>
            </div>
            {validationErrors.email && (
              <div className={styles.errorMessage}>{validationErrors.email}</div>
            )}
          </div>

          {/* Password field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${formState.password ? styles[`password${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`] : ""} ${validationErrors.password ? styles.error : ""}`}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.floatingInput}
                value={formState.password || ''}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              <label
                htmlFor="password"
                className={`${styles.floatingLabel} ${formState.password ? styles.hasContent : ""}`}
              >
                Password 
              </label>
              {formState.password && (
                <div className={styles.strengthIndicator}></div>
              )}
            </div>
            {formState.password && (
              <div className={`${styles.passwordStrengthText} ${styles[passwordStrength]}`}>
                {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
              </div>
            )}
            {validationErrors.password && (
              <div className={styles.errorMessage}>{validationErrors.password}</div>
            )}
          </div>

          {/* Confirm Password field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${passwordMatch !== null ? (passwordMatch ? styles.passwordMatch : styles.passwordMismatch) : ""} ${validationErrors.confirmPassword ? styles.error : ""}`}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={styles.floatingInput}
                value={formState.confirmPassword || ''}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              <label
                htmlFor="confirmPassword"
                className={`${styles.floatingLabel} ${formState.confirmPassword ? styles.hasContent : ""}`}
              >
                Confirm Password 
              </label>
            </div>
            {formState.confirmPassword && passwordMatch !== null && (
              <div className={`${styles.passwordStrengthText} ${passwordMatch ? styles.match : styles.mismatch}`}>
                {passwordMatch ? "Matching" : "Mismatching"}
              </div>
            )}
            {validationErrors.confirmPassword && (
              <div className={styles.errorMessage}>{validationErrors.confirmPassword}</div>
            )}
          </div>

          {/* Date of Birth field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${validationErrors.dateOfBirth ? styles.error : ""}`}>
              <span className={styles.inputIcon}>📅</span>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                className={`${styles.floatingInput} ${styles.dateInput}`}
                value={formState.dateOfBirth || ''}
                onChange={handleInputChange}
                placeholder=" "
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {!formState.dateOfBirth && (
                <div className={styles.datePlaceholder}>
                  
                </div>
              )}
            </div>
            {validationErrors.dateOfBirth && (
              <div className={styles.errorMessage}>{validationErrors.dateOfBirth}</div>
            )}
          </div>

          {/* Phone field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${validationErrors.phone ? styles.error : ""}`}>
              <span className={styles.inputIcon}>📱</span>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={styles.floatingInput}
                value={formState.phone || ''}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              <label
                htmlFor="phone"
                className={`${styles.floatingLabel} ${formState.phone ? styles.hasContent : ""}`}
              >
                Phone Number
              </label>
            </div>
            {validationErrors.phone && (
              <div className={styles.errorMessage}>{validationErrors.phone}</div>
            )}
          </div>

          {/* City field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${validationErrors.city ? styles.error : ""}`}>
              <span className={styles.inputIcon}>🏙️</span>
              <input
                type="text"
                id="city"
                name="city"
                className={styles.floatingInput}
                value={formState.city || ''}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              <label
                htmlFor="city"
                className={`${styles.floatingLabel} ${formState.city ? styles.hasContent : ""}`}
              >
                City
              </label>
            </div>
            {validationErrors.city && (
              <div className={styles.errorMessage}>{validationErrors.city}</div>
            )}
          </div>

          {/* Gender field */}
          <div className={styles.inputGroup}>
            <div className={`${styles.floatingInputWrapper} ${validationErrors.gender ? styles.error : ""}`}>
              <span className={styles.inputIcon}>👥</span>
              <select
                id="gender"
                name="gender"
                className={`${styles.floatingInput} ${styles.gender}`}
                value={formState.gender || ''}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {!formState.gender && (
                <div className={styles.datePlaceholder}>
                  Select Gender
                </div>
              )}
            </div>
            {validationErrors.gender && (
              <div className={styles.errorMessage}>{validationErrors.gender}</div>
            )}
          </div>
        </form>
      </div>
      
      {/* Navigation buttons - outside of scrollable area */}
      <div className={styles.navigationContainer}>
        <button type="button" className={styles.backButton} disabled>
          Back
        </button>
        <button 
          type="button" 
          className={styles.nextButton}
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </>
  );
};

BasicInfoStep.propTypes = {
  formState: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
    phone: PropTypes.string,
    city: PropTypes.string,
    gender: PropTypes.string,
    dateOfBirth: PropTypes.string,
    touched: PropTypes.object,
    errors: PropTypes.object,
  }),
  handleChange: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  passwordStrength: PropTypes.string.isRequired,
};

export default BasicInfoStep;