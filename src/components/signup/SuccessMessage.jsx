import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './SuccessMessage.module.css';

const SuccessMessage = ({ email }) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.successContainer}>
      <div className={styles.successIcon}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="#4CAF50" strokeWidth="4"/>
          <path d="M25 40L35 50L55 30" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <h2 className={styles.successTitle}>{t('signup.success.title')}</h2>
      
      <p className={styles.successMessage}>
        {t('signup.success.message')}
        <span className={styles.emailHighlight}>{email}</span>
      </p>
      
      <div className={styles.verificationNote}>
        <div className={styles.noteIcon}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18ZM11 5H9V11H15V9H11V5Z" fill="#FFD54F"/>
          </svg>
        </div>
        <p>{t('signup.success.verification')}</p>
      </div>
      
      <div className={styles.actionButtons}>
        <Link to="/login" className={styles.loginButton}>
          {t('signup.success.goToLogin')}
        </Link>
        
        <button className={styles.resendButton} onClick={() => alert('Verification email resent!')}>
          {t('signup.success.resendEmail')}
        </button>
      </div>
      
      <div className={styles.helpText}>
        <p>
          {t('signup.success.helpText')} 
          <a href="mailto:support@connvia.com" className={styles.supportLink}>
            support@connvia.com
          </a>
        </p>
      </div>
    </div>
  );
};

SuccessMessage.propTypes = {
  email: PropTypes.string.isRequired
};

// Default translations if not provided by i18n
if (!window.i18next) {
  window.i18next = {
    t: (key) => {
      const translations = {
        'signup.success.title': 'Account Created Successfully!',
        'signup.success.message': 'We have sent a verification email to ',
        'signup.success.verification': 'Please verify your email address to activate your account.',
        'signup.success.goToLogin': 'Go to Login',
        'signup.success.resendEmail': 'Resend Verification Email',
        'signup.success.helpText': 'Need help? Contact us at'
      };
      return translations[key] || key;
    }
  };
}

export default SuccessMessage;