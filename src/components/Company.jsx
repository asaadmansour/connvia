// import AboutConnvia from "./AboutConnvia";
import About from "./About";
import WhoCanUse from "./WhoCanUse";
// import Partners from "./Partners";
import styles from "./Company.module.css";
import Section from "./Section";
import { motion } from "framer-motion";
import { containerVariants } from "../utils/animations";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function CompanySection({ defaultSection = "about" }) {
  // State to track which section is active
  const [activeSection, setActiveSection] = useState(defaultSection);

  // Update active section when defaultSection prop changes
  useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection]);

  // Function to handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <Section
      type="about"
      id="company-section"
      className={styles.companySection}
    >
      <motion.div
        className={styles.companyContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Company Navigation */}
        <motion.div className={styles.companyNav} variants={containerVariants}>
          <Link
            to="#about"
            className={activeSection === "about" ? styles.active : ""}
            onClick={() => handleSectionChange("about")}
          >
            About
          </Link>
          <Link
            to="#who-can-use"
            className={activeSection === "who-can-use" ? styles.active : ""}
            onClick={() => handleSectionChange("who-can-use")}
          >
            Who Can Use
          </Link>
          {/* Add more navigation links as needed */}
        </motion.div>

        {/* Conditional rendering based on active section */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={styles.sectionWrapper}
        >
          {activeSection === "about" && <About />}
          {activeSection === "who-can-use" && <WhoCanUse />}
          {/* Add more sections as needed */}
        </motion.div>

        {/* You can add more sections here in the future */}
        {/* <div id="partners" className={styles.sectionWrapper}>
          <Partners />
        </div> */}
      </motion.div>
    </Section>
  );
}

CompanySection.propTypes = {
  defaultSection: PropTypes.string,
};

export default CompanySection;
