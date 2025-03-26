import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import styles from "./HeaderNav.module.css";
import {
  headerVariants,
  logoVariants,
  authButtonVariants,
} from "../utils/animations";

function HeaderNav({ bgColor = "var(--purple-dark)" }) {
  return (
    <motion.div
      className={styles.headerNav}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      style={{ backgroundColor: bgColor }}
    >
      {/* Logo Animation */}
      <motion.div variants={logoVariants}>
        <Logo color="var(--white)" />
      </motion.div>

      {/* Auth Buttons with Animation */}
      <div className={styles.authButtons}>
        <motion.div
          variants={authButtonVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/login" className={`${styles.authButton} ${styles.login}`}>
            <span>Log in</span>
          </Link>
        </motion.div>
        <motion.div
          variants={authButtonVariants}
          initial="hidden"
          animate="visible"
        >
          <Link
            to="/signup"
            className={`${styles.authButton} ${styles.signup}`}
          >
            <span>Sign up</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HeaderNav;
