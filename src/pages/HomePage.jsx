import PageNav from "../components/PageNav";
import Hero from "../components/Hero";
import HeaderNav from "../components/HeaderNav";
import Video from "../components/Video";
import AuthFooter from "../components/AuthFooter";
import Section from "../components/Section";
import styles from "./HomePage.module.css";
import CompanySection from "../components/Company";
import PropTypes from "prop-types";

function Homepage({ defaultSection }) {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.videoContainer}>
        <Video />
      </div>

      <Section id="header-section" type="header">
        <HeaderNav />
        <Hero />
      </Section>

      <CompanySection defaultSection={defaultSection} />

      <Section id="nav-section" type="nav">
        <PageNav />
      </Section>

      <Section id="footer-section" type="footer">
        <AuthFooter />
      </Section>
    </div>
  );
}

Homepage.propTypes = {
  defaultSection: PropTypes.string,
};

export default Homepage;
