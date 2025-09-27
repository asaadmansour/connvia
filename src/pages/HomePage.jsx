import PageNav from "../components/PageNav";
import Hero from "../components/Hero";
import HeaderNav from "../components/HeaderNav";
import Video from "../components/Video";
import AuthFooter from "../components/AuthFooter";
import Section from "../components/Section";
import styles from "./HomePage.module.css";
import CompanySection from "../components/Company";
import TrendingEvents from "../components/TrendingEvents";
import PropTypes from "prop-types";
import Partners from "../components/Partners";
import Testimonials from "../components/testimonials";
import Contact from "../components/ContactUs";
import ScrollToTop from "../components/ScrollToTop";

function Homepage({ defaultSection }) {
  return (
    <div className={styles.homeContainer}>
      <ScrollToTop />
      <Section id="header-section" type="header">
        <div className={styles.videoContainer}>
          <Video />
        </div>
        <HeaderNav bgColor="transparent" />
        <Hero />
      </Section>
      <Section>
        <TrendingEvents />
      </Section>
      <CompanySection defaultSection={defaultSection} />
      <Section id="partners-section" type="partners">
        <Partners />
      </Section>
      <Section id="nav-section" type="nav">
        <PageNav />
      </Section>
      <Section id="testimonialsSection" type="review">
        <Testimonials />
      </Section>
      <Section id="contactUs" type="contact">
        <Contact />
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
