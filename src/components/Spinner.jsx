import PropTypes from "prop-types";
import styles from "./Spinner.module.css";

const Spinner = ({ size = "medium", fullScreen = false }) => {
  const sizeClass =
    {
      small: styles.spinnerSmall,
      medium: styles.spinnerMedium,
      large: styles.spinnerLarge,
    }[size] || styles.spinnerMedium;

  if (fullScreen) {
    return (
      <div className={styles.spinnerFullscreen}>
        <div className={`${styles.spinner} ${sizeClass}`}>
          <div className={styles.doubleBounce1}></div>
          <div className={styles.doubleBounce2}></div>
        </div>
        <p className={styles.spinnerText}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.spinner} ${sizeClass}`}>
      <div className={styles.doubleBounce1}></div>
      <div className={styles.doubleBounce2}></div>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  fullScreen: PropTypes.bool,
};

export default Spinner;
