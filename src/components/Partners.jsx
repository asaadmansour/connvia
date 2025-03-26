import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import styles from "./Partners.module.css";
import Section from "./Section";
import { motion } from "framer-motion";
import { containerVariants } from "../utils/animations";

function Partners() {
  const partnersRow1 = [
    { img: "./images.png", alt: "Partner 1" },
    { img: "./1.png", alt: "Partner 2" },
    { img: "2.png", alt: "Partner 3" },
    { img: "./4.png", alt: "Partner 4" },
  ];

  const partnersRow2 = [
    { img: "5.webp", alt: "Partner 5" },
    { img: "6.webp", alt: "Partner 6" },
    { img: "9.png", alt: "Partner 7" },
    { img: "34.png", alt: "Partner 8" },
  ];

  return (
    <Section id="partners" className={styles.partnersSection}>
      <motion.div
        className={styles.partnersContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section Title */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Partners
        </motion.h1>

        <div className={styles.slidersWrapper}>
          {/* First row - Sliding Left */}
          <Swiper
            slidesPerView={4}
            spaceBetween={20}
            loop={true} // Ensures infinite loop
            loopfillgroupwithblank="true" // Prevents gaps - converted to string
            autoplay={{ delay: 1, disableOnInteraction: false }}
            speed={3000} // Continuous speed
            allowTouchMove={false} // Prevents user interruption
            cssMode={false} // Ensures smooth animation
            modules={[Autoplay]}
            className={styles.swiper}
          >
            {[...partnersRow1, ...partnersRow1].map((partner, index) => (
              <SwiperSlide key={index} className={styles.slide}>
                <div className={styles.imageWrapper}>
                  <div className={styles.imageOverlay}></div>
                  <img src={partner.img} alt={partner.alt} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Second row - Sliding Right (Opposite Direction) */}
          <Swiper
            slidesPerView={4}
            spaceBetween={20}
            loop={true}
            loopfillgroupwithblank="true" // Converted to string
            autoplay={{
              delay: 1,
              disableOnInteraction: false,
              reverseDirection: true,
            }}
            speed={3000}
            allowTouchMove={false}
            cssMode={false}
            modules={[Autoplay]}
            className={styles.swiper}
          >
            {[...partnersRow2, ...partnersRow2].map((partner, index) => (
              <SwiperSlide key={index} className={styles.slide}>
                <div className={styles.imageWrapper}>
                  <div className={styles.imageOverlay}></div>
                  <img src={partner.img} alt={partner.alt} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>
    </Section>
  );
}

export default Partners;
