import styles from "./AuthFooter.module.css";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

function AuthFooter({ linkColor = "#ffffff", linkHoverColor = "#e2e2e2" }) {
  return (
    <>
      <div className={styles.footer}>
        <div
          className={styles.footerLinks}
          style={{
            "--link-color": linkColor,
            "--link-hover-color": linkHoverColor,
          }}
        >
          <Link to="/privacy">Privacy Policy</Link>
          <span className={styles.divider}>•</span>
          <Link to="/cookies">Cookies Policy</Link>
          <span className={styles.divider}>•</span>
          <Link to="/terms">Terms & Conditions</Link>
          <span className={styles.divider}>•</span>
          <Link to="/support">Support</Link>
        </div>
        <div className={styles.copyright}>2025 Connvia</div>
      </div>
    </>
  );
}

AuthFooter.propTypes = {
  linkColor: PropTypes.string,
  linkHoverColor: PropTypes.string,
};

export default AuthFooter;
