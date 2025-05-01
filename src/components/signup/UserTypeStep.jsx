import PropTypes from 'prop-types';
import styles from '../../pages/Signup.module.css';

const UserTypeStep = ({ formState, handleChange, handleNextStep, handlePrevStep }) => {
  const userTypes = [
    {
      id: 'attendee',
      title: 'Attendee',
      description: 'Join events, network with others, and enjoy the experience',
      icon: '👤'
    },
    {
      id: 'vendor',
      title: 'Vendor',
      description: 'Showcase your products and services at events',
      icon: '🛍️'
    },
    {
      id: 'organizer',
      title: 'Event Creator',
      description: 'Create and manage your own events',
      icon: '📅'
    },
    {
      id: 'venue',
      title: 'Venue Owner',
      description: 'List your venue for events and bookings',
      icon: '🏢'
    }
  ];

  const handleUserTypeSelect = (userType) => {
    handleChange({
      target: {
        name: 'user_type',
        value: userType
      }
    });
  };

  return (
    <>
      <div className={styles.formScrollContainer}>
        <h2 className={styles.stepTitle}>Choose Your Role</h2>
        <p className={styles.stepDescription}>
          Select the type of account that best fits your needs
        </p>

        <div className={styles.userTypeContainer}>
          {userTypes.map((type, index) => (
            <div
              key={type.id}
              className={`${styles.userTypeBox} ${formState.user_type === type.id ? styles.selected : ''}`}
              onClick={() => handleUserTypeSelect(type.id)}
            >
              <div className={styles.userTypeIcon}>{type.icon}</div>
              <h3 className={styles.userTypeTitle}>{type.title}</h3>
              <p className={styles.userTypeDescription}>{type.description}</p>
            </div>
          ))}
        </div>

        {formState.touched?.user_type && formState.errors?.user_type && (
          <div className={styles.errorMessage}>{formState.errors.user_type}</div>
        )}
      </div>
      
      {/* Navigation buttons - outside of scrollable area */}
      <div className={styles.navigationContainer}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handlePrevStep}
        >
          Back
        </button>
        <button
          type="button"
          className={styles.nextButton}
          onClick={handleNextStep}
          disabled={!formState.user_type}
        >
          Next
        </button>
      </div>
    </>
  );
};

UserTypeStep.propTypes = {
  formState: PropTypes.shape({
    user_type: PropTypes.string,
    touched: PropTypes.object,
    errors: PropTypes.object
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  handlePrevStep: PropTypes.func.isRequired
};

export default UserTypeStep;