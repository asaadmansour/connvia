import { useState } from "react";
import styles from "./TrendingEvents.module.css";
import EventCard from "./EventCard";
import { motion } from "framer-motion";
import {Link} from "react-router-dom";

function TrendingEvents() {
  // Sample trending events data
  const [trendingEvents] = useState([
    {
      id: 1,
      title: "Cairo Tech Summit",
      image: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg",
      category: "Technology",
      date: "March 25, 2025",
      location: "Cairo International Convention Center",
    },
    {
      id: 2,
      title: "Egyptian Food Festival",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      category: "Food & Drink",
      date: "April 10-12, 2025",
      location: "Alexandria Corniche",
    },
    {
      id: 3,
      title: "Luxor Cultural Exhibition",
      image: "https://images.pexels.com/photos/3937174/pexels-photo-3937174.jpeg",
      category: "Arts & Culture",
      date: "April 5, 2025",
      location: "Luxor Museum",
    },
  ]);

  const handleEventClick = (eventId) => {
    console.log(`Navigating to trending event ${eventId}`);
    // In a real app, use React Router to navigate
  };

  return (
    <div className={styles.trendingEventsSection}>
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>Trending Events</h2>
        <p className={styles.sectionDescription}>
          Discover the most popular events happening across Egypt
        </p>
      </motion.div>
      
      <div className={styles.eventsGrid}>
        {trendingEvents.map((event) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * event.id }}
          >
            <EventCard event={event} onClick={handleEventClick} />
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className={styles.viewMoreContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Link to="/events" className={styles.viewMoreButton}>
          View All Events
        </Link>
      </motion.div>
    </div>
  );
}

export default TrendingEvents;