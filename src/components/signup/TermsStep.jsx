import PropTypes from 'prop-types';
import ReCAPTCHA from 'react-google-recaptcha';
import Spinner from '../../components/Spinner';
import styles from './TermsStep.module.css';

const TermsStep = ({ formState, handleChange, handleSubmit, handlePrevStep, isSubmitting, recaptchaRef }) => {
  return (
    <div className={styles.stepForm}>
      <h2 className={styles.stepTitle}>Terms & Conditions</h2>
      <p className={styles.stepDescription}>Please review and accept our terms</p>
      
      <form onSubmit={handleSubmit}>
        {/* Terms and Conditions Box */}
        <div className={styles.termsBox}>
          <h3>Terms and Conditions for Connvia</h3>
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          <br />
          <p>Welcome to Connvia. By creating an account, you agree to comply with and be bound by the following terms and conditions of use.</p>
          <br />
          <h4>1. Account Registration</h4>
          <p>To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
          <br />
          <h4>2. User Responsibilities</h4>
          <p>You are responsible for safeguarding your password and for all activities that occur under your account. You agree not to disclose your password to any third party.</p>
          <br />
          <h4>3. User Types and Roles</h4>
          <p>Connvia offers different user types (Attendee, Vendor, Organizer, Venue Owner) with specific features and responsibilities for each role. By selecting a user type, you agree to fulfill the responsibilities associated with that role.</p>
          <br />
          <h4>4. Content</h4>
          <p>You retain all rights to any content you submit, post, or display on or through the Service. By submitting content to Connvia, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content.</p>
          <br />
          <h4>5. Privacy</h4>
          <p>Your use of Connvia is also governed by our Privacy Policy, which can be found on our website.</p>
          <br />
          <h4>6. Termination</h4>
          <p>We reserve the right to terminate or suspend your account at any time for any reason without notice.</p>
          <br />
          <h4>7. Changes to Terms</h4>
          <p>We reserve the right to modify these terms at any time. Your continued use of Connvia after such modifications constitutes your acceptance of the revised terms.</p>
          <br />
          <h4>8. Email Verification</h4>
          <p>Email verification is required before you can log in to your account. We will send a verification link to the email address you provide during registration.</p>
        </div>

        {/* Terms Acceptance Checkbox */}
        <div className={`${styles.formGroup} ${formState.touched.termsAccepted && formState.errors.termsAccepted ? styles.hasError : ""}`}>
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              className={styles.checkbox}
              checked={formState.termsAccepted}
              onChange={handleChange}
              required
            />
            <label htmlFor="termsAccepted" className={styles.checkboxLabel}>
              By creating an account, you accept the Terms and Conditions *
            </label>
          </div>
          {formState.touched.termsAccepted && formState.errors.termsAccepted && (
            <div className={styles.errorMessage}>{formState.errors.termsAccepted}</div>
          )}
        </div>

        {/* reCAPTCHA */}
        <div className={`${styles.formGroup} ${formState.touched.recaptchaToken && formState.errors.recaptchaToken ? styles.hasError : ""}`}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} // Fallback to test key
            onChange={(token) => {
              handleChange({
                target: {
                  name: 'recaptchaToken',
                  value: token
                }
              });
            }}
            onExpired={() => {
              handleChange({
                target: {
                  name: 'recaptchaToken',
                  value: null
                }
              });
            }}
            className={styles.recaptcha}
          />
          {formState.touched.recaptchaToken && formState.errors.recaptchaToken && (
            <div className={styles.errorMessage}>{formState.errors.recaptchaToken}</div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className={styles.navigationButtons}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handlePrevStep}
          >
            Back
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

TermsStep.propTypes = {
  formState: PropTypes.shape({
    termsAccepted: PropTypes.bool,
    recaptchaToken: PropTypes.string,
    touched: PropTypes.object,
    errors: PropTypes.object
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handlePrevStep: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  recaptchaRef: PropTypes.object.isRequired
};

export default TermsStep;