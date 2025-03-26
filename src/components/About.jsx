import { motion } from "framer-motion";
import styles from "./About.module.css";
import Section from "./Section";
import { containerVariants, textVariants } from "../utils/animations";
import PropTypes from "prop-types";

function About({ isStandalone = false }) {
  const content = (
    <motion.div
      className={styles.aboutContent}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 className={styles.sectionTitle} variants={textVariants}>
        About Connvia
      </motion.h2>

      <motion.div
        className={styles.aboutSection}
        whileHover={{
          y: -10,
          rotateY: -5,
          rotateX: 5,
          z: 20,
          boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.2)",
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <h3>What is Connvia?</h3>
        <p>
          Connvia is a comprehensive event management platform that connects
          attendees, organizers, vendors, and venues, providing a seamless
          experience for discovering, planning, and hosting events.
        </p>
      </motion.div>

      <motion.div
        className={styles.aboutSection}
        whileHover={{
          y: -10,
          rotateY: -5,
          rotateX: 5,
          z: 20,
          boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.2)",
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <h3>Our Mission</h3>
        <p>
          Our mission is to revolutionize the event industry by offering an
          all-in-one platform that empowers organizers, vendors, and venues
          while ensuring attendees have access to unforgettable experiences.
        </p>
      </motion.div>

      <motion.div
        className={styles.aboutSection}
        whileHover={{
          y: -10,
          rotateY: -5,
          rotateX: 5,
          z: 20,
          boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.2)",
          transition: { duration: 0.1, ease: "easeOut" },
        }}
      >
        <h3>Our Vision</h3>
        <p>
          We envision a world where event planning is effortless, collaboration
          is seamless, and discovering incredible experiences is just a tap
          away. Connvia aims to be the leading event ecosystem that connects
          people globally.
        </p>
      </motion.div>
    </motion.div>
  );

  if (isStandalone) {
    return (
      <Section className={styles.aboutContainer} id="about">
        {content}
      </Section>
    );
  }

  return <div className={styles.aboutContainer}>{content}</div>;
}

About.propTypes = {
  isStandalone: PropTypes.bool,
};

export default About;
