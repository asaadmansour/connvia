import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./WhoCanUse.module.css";
import Section from "./Section";
import { containerVariants, textVariants } from "../utils/animations";
import PropTypes from "prop-types";

import { Users, ClipboardList, Utensils, Building2 } from "lucide-react";
function WhoCanUse({ isStandalone = false }) {
  const [flippedCard, setFlippedCard] = useState(null);

  const cards = [
    {
      id: "attendees",
      title: "Attendees",
      icon: <Users size={32} style={{ color: "var(--purple-dark)" }} />, // 👥
      description:
        "Discover and attend exciting events tailored to your interests. Mark events as 'Interested,' buy tickets, and stay updated on the latest happenings!",
    },
    {
      id: "organizers",
      title: "Organizers",
      icon: <ClipboardList size={32} style={{ color: "var(--purple-dark)" }} />, // 📋
      description:
        "Plan, promote, and manage your events seamlessly. Connect with vendors, book venues, and reach the right audience—all in one place!",
    },
    {
      id: "vendors",
      title: "Vendors",
      icon: <Utensils size={32} style={{ color: "var(--purple-dark)" }} />, // 🍽️
      description:
        "Showcase your services to event organizers. Get discovered, receive bookings, and grow your business with our platform!",
    },
    {
      id: "venues",
      title: "Venues",
      icon: <Building2 size={32} style={{ color: "var(--purple-dark)" }} />, // 🏢
      description:
        "List your venue and connect with event organizers. Manage bookings, showcase your space, and maximize your venue's potential!",
    },
  ];

  const handleCardFlip = (id) => {
    setFlippedCard(flippedCard === id ? null : id);
  };

  const content = (
    <motion.div
      className={styles.whoCanUseContent}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 className={styles.sectionTitle} variants={textVariants}>
        Who Can Use Connvia?
      </motion.h2>

      <div className={styles.cardsContainer}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={styles.cardSection}
            variants={textVariants}
          >
            <div
              className={`${styles.card} ${
                flippedCard === card.id ? styles.flipped : ""
              }`}
              onClick={() => handleCardFlip(card.id)}
            >
              <div className={styles.cardFace}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h3>{card.title}</h3>
              </div>
              <div className={styles.cardFaceBack}>
                <p>{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  if (isStandalone) {
    return (
      <Section className={styles.whoCanUseContainer} id="who-can-use">
        {content}
      </Section>
    );
  }

  return <div className={styles.whoCanUseContainer}>{content}</div>;
}

WhoCanUse.propTypes = {
  isStandalone: PropTypes.bool,
};

export default WhoCanUse;
