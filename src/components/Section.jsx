import PropTypes from "prop-types";
import styles from "./Section.module.css";

function Section({ children, id, className, type = "default" }) {
  // Determine the CSS class based on the section type
  const sectionClass =
    type !== "default"
      ? `${styles.section} ${styles[`${type}Section`]} ${className || ""}`
      : `${styles.section} ${className || ""}`;

  return (
    <section className={sectionClass} id={id}>
      {children}
    </section>
  );
}

Section.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf([
    "default",
    "header",
    "hero",
    "about",
    "nav",
    "footer",
  ]),
};

export default Section;
