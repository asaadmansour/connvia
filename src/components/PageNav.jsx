import { motion } from "framer-motion";
import Links from "./Links";
import styles from "./PageNav.module.css";
import { navVariants } from "../utils/animations";

function PageNav() {
  return (
    <motion.nav
      className={styles.nav}
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.container}>
        <Links />
      </div>
    </motion.nav>
  );
}

export default PageNav;
