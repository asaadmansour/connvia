import Logo from "../components/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import styles from "./AuthHeader.module.css";
function AuthHeader() {
  return (
    <div className={styles.formHeader}>
    <div className={styles.logoContainer}>
    <Logo color="var(--purple-mid)" />
    </div>
    <div >
      <LanguageSwitcher />
    </div>
  </div>
  );
}

export default AuthHeader;