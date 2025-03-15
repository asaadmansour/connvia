import styles from './AuthFooter.module.css'
import { Link } from 'react-router-dom';
function AuthFooter() {
  return (
    <>
    <div className={styles.footer}>
            <div className={styles.footerLinks}>
              <Link to="/privacy">Privacy Policy</Link>
              <span className={styles.divider}>•</span>
              <Link to="/cookies">Cookies Policy</Link>
              <span className={styles.divider}>•</span>
              <Link to="/terms">Terms & Conditions</Link>
              <span className={styles.divider}>•</span>
              <Link to="/support">Support</Link>
            </div>
            <div className={styles.copyright}>
              2025 Connvia
            </div>
          </div>
    </>
  );
}

export default AuthFooter;