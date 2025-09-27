import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

function Footer({ backgroundColor = "#f8f9fa" }) {
  return (
    <footer className={styles.footer} style={{ backgroundColor }}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Connvia</h3>
            <p>Connecting venues with event organizers and vendors for seamless event planning.</p>
          </div>
          
          <div className={styles.footerSection}>
            <h3>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/company">Company</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3>Legal</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/cookies">Cookies Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3>Contact</h3>
            <ul className={styles.footerLinks}>
              <li>Email: info@connvia.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Event St, Cairo, Egypt</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>© 2025 Connvia. All rights reserved.</div>
          <div className={styles.socialLinks}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  backgroundColor: PropTypes.string
};

export default Footer;
