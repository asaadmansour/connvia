import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.languageSwitcher} ref={dropdownRef}>
      <button className={styles.switcher} onClick={toggleDropdown}>
        {i18n.language === "ar" ? "العربية" : "English"}
        <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <button 
            className={`${styles.option} ${i18n.language === "en" ? styles.active : ""}`} 
            onClick={() => changeLanguage("en")}
          >
            English
          </button>
          <button 
            className={`${styles.option} ${i18n.language === "ar" ? styles.active : ""}`} 
            onClick={() => changeLanguage("ar")}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
