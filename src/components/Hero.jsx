import { motion } from "framer-motion";
import styles from "./Hero.module.css";
import { containerVariants, textVariants, buttonVariants } from "../utils/animations";

function Hero() {
  return (
    <motion.div
      className={styles.hero}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.content}>
        <motion.h1 className={styles.title} variants={textVariants}>
          One app for
          <br />
          all occasions
        </motion.h1>
        <motion.p className={styles.subtitle} variants={textVariants}>
          Single account for all your events
        </motion.p>

        {/* Store buttons with animation */}
        <motion.div className={styles.storeButtons} variants={containerVariants}>
          <motion.a
            href="#"
            className={styles.storeButton}
            variants={buttonVariants}
          >
            <i className="fab fa-apple fa-lg"></i>
            <span>
              <small>Download on the</small>
              App Store
            </span>
          </motion.a>
          <motion.a
            href="#"
            className={styles.storeButton}
            variants={buttonVariants}
          >
            <i className="fab fa-google-play fa-lg"></i>
            <span>
              <small>GET IT ON</small>
              Google Play
            </span>
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Hero;
