import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import styles from "./Partners.module.css";
import Section from "./Section";
import { motion } from "framer-motion";
import { containerVariants } from "../utils/animations";

function Partners() {
  const partners = [
    { img: "./images.png", alt: "Partner 1" },
    { img: "./1.png", alt: "Partner 2" },
    {
      img: "2.png",
      alt: "Partner 3",
    },
    { img: "./4.png", alt: "Partner 4" },
    { img: "https://source.unsplash.com/150x150/?finance", alt: "Partner 5" },
  ];

  return (
    <Section id="partners" className={styles.partnersSection}>
      <motion.div
        className={styles.partnersContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section Title - Styled to Match */}
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Partners
        </motion.h2>

        <div className={styles.slidersWrapper}>
          {/* First row - Sliding Left */}
          <Swiper
            slidesPerView={4}
            spaceBetween={20}
            loop={true}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            modules={[Autoplay]}
            className={styles.swiper}
          >
            {partners.map((partner, index) => (
              <SwiperSlide key={index} className={styles.slide}>
                <img src={partner.img} alt={partner.alt} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Second row - Sliding Right */}
          <Swiper
            slidesPerView={4}
            spaceBetween={20}
            loop={true}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              reverseDirection: true,
            }}
            modules={[Autoplay]}
            className={styles.swiper}
          >
            {partners.map((partner, index) => (
              <SwiperSlide key={index} className={styles.slide}>
                <img src={partner.img} alt={partner.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>
    </Section>
  );
}

export default Partners;
