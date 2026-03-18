import { useState, useEffect } from "react";
import styles from "./TrendingEvents.module.css";
import EventCard from "./EventCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllEvents } from "../utils/eventService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TrendingEvents() {
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await getAllEvents();
        
        if (response.success && response.data && response.data.events) {
          // Get up to 6 events for the trending section
          const events = response.data.events.slice(0, 6).map(event => {
            // Parse location data
            let locationName = "TBA";
            let coordinates = null;
            
            /* log removed */
            
            // First try to use the venue_name if available
            if (event.venue_name) {
              /* log removed */
              locationName = event.venue_name;
            } else if (event.venue) {
              /* log removed */
              locationName = event.venue;
            }
            
            // Try to parse location data from either location or venue_location field
            const locationField = event.location || event.venue_location;
            
            if (locationField) {
              /* log removed */
              try {
                // Parse the JSON location string
                let locationData;
                
                // Handle different formats of location data
                if (typeof locationField === 'string') {
                  /* log removed */
                  // If it's a string, try to parse it as JSON
                  locationData = JSON.parse(locationField);
                } else if (typeof locationField === 'object') {
                  /* log removed */
                  // If it's already an object, use it directly
                  locationData = locationField;
                }
                
                /* log removed */
                
                // Check if we have valid coordinates
                if (locationData && locationData.lat && locationData.lng) {
                  /* log removed */
                  
                  coordinates = {
                    lat: parseFloat(locationData.lat),
                    lng: parseFloat(locationData.lng)
                  };
                  
                  // If we don't already have a venue name, use the coordinates
                  if (locationName === "TBA") {
                    locationName = `${parseFloat(locationData.lat).toFixed(2)}, ${parseFloat(locationData.lng).toFixed(2)}`;
                    /* log removed */
                  }
                } else {
                  /* log removed */
                }
              } catch (error) {
                /* log removed */
                /* log removed */
              }
            } else {
              /* log removed */
            }
            
            /* log removed */
            
            // Format date
            const eventDate = new Date(event.start_date || event.date);
            const formattedDate = !isNaN(eventDate.getTime()) ? 
              eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + 
              (event.start_time ? ` at ${event.start_time}` : '') : "TBA";
            
            return {
              id: event.event_ID,
              title: event.name,
              image: event.image || "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg",
              category: event.category_name || "Event",
              date: event.start_date || event.date,
              formattedDate,
              location: locationName,
              venue: event.venue_name || event.venue,
              price: event.price,
              description: event.description,
              coordinates
            };
          });
          
          setTrendingEvents(events);
        } else {
          /* log removed */
          toast.error("Failed to load events. Please try again later.");
        }
      } catch (error) {
        /* log removed */
        toast.error("Error loading events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    /* log removed */
    // In a real app, use React Router to navigate
  };

  return (
    <div className={styles.trendingEventsSection}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
      
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <p>Loading events...</p>
        </div>
      ) : trendingEvents.length > 0 ? (
        <div className={styles.eventsGrid}>
          {trendingEvents.map((event, index) => {
            // Log the event key for debugging
            const eventKey = event.id || event.event_ID || `trending-event-${index}`;
            /* log removed */
            
            return (
              <motion.div 
                key={eventKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <EventCard event={event} onClick={handleEventClick} />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noEventsMessage}>
          <p>No events available at the moment. Check back later!</p>
        </div>
      )}
      
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