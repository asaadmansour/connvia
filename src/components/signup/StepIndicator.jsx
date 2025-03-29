// src/components/signup/StepIndicator.jsx
import { PropTypes } from 'prop-types';
import styles from '../../pages/Signup.module.css';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressInfo}>
        <span className={styles.progressText}>Step {currentStep} of {totalSteps}</span>
        <span className={styles.progressPercentage}>&nbsp;</span>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

StepIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
};

export default StepIndicator;
