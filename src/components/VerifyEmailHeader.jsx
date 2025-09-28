import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./VerifyEmailHeader.module.css";

function VerifyEmailHeader() {
  return (
    <div className={styles.verifyEmailHeader}>
      <div className={styles.logoContainer}>
        <Logo color="var(--purple-mid)" />
      </div>
      <div className={styles.languageContainer}>
        <LanguageSwitcher />
      </div>
    </div>
  );
}

export default VerifyEmailHeader;
