import React from 'react';
import PropTypes from 'prop-types';
import styles from './UserTypeStep.module.css';

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
    <div className={styles.stepForm}>
      <h2 className={styles.stepTitle}>Choose Your Role</h2>
      <p className={styles.stepDescription}>
        Select the type of account that best fits your needs
      </p>

      <div className={styles.userTypeGrid}>
        {userTypes.map((type) => (
          <div
            key={type.id}
            className={`${styles.userTypeCard} ${formState.user_type === type.id ? styles.selected : ''}`}
            onClick={() => handleUserTypeSelect(type.id)}
          >
            <div className={styles.userTypeIcon}>{type.icon}</div>
            <h3 className={styles.userTypeTitle}>{type.title}</h3>
            <p className={styles.userTypeDescription}>{type.description}</p>
          </div>
        ))}
      </div>

      {formState.touched.user_type && formState.errors.user_type && (
        <div className={styles.errorMessage}>{formState.errors.user_type}</div>
      )}

      <div className={styles.navigationButtons}>
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
          Next Step
        </button>
      </div>
    </div>
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