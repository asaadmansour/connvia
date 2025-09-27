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
            
            console.log('TrendingEvents - Raw event data:', {
              event_ID: event.event_ID,
              name: event.name,
              venue_name: event.venue_name,
              venue: event.venue,
              location: event.location,
              venue_location: event.venue_location
            });
            
            // First try to use the venue_name if available
            if (event.venue_name) {
              console.log(`TrendingEvents - Using venue_name: ${event.venue_name}`);
              locationName = event.venue_name;
            } else if (event.venue) {
              console.log(`TrendingEvents - Using venue field: ${event.venue}`);
              locationName = event.venue;
            }
            
            // Try to parse location data from either location or venue_location field
            const locationField = event.location || event.venue_location;
            
            if (locationField) {
              console.log(`TrendingEvents - Found location data: ${locationField}`);
              try {
                // Parse the JSON location string
                let locationData;
                
                // Handle different formats of location data
                if (typeof locationField === 'string') {
                  console.log('TrendingEvents - Location is a string, parsing as JSON');
                  // If it's a string, try to parse it as JSON
                  locationData = JSON.parse(locationField);
                } else if (typeof locationField === 'object') {
                  console.log('TrendingEvents - Location is already an object');
                  // If it's already an object, use it directly
                  locationData = locationField;
                }
                
                console.log('TrendingEvents - Parsed location data:', locationData);
                
                // Check if we have valid coordinates
                if (locationData && locationData.lat && locationData.lng) {
                  console.log(`TrendingEvents - Valid coordinates found: lat=${locationData.lat}, lng=${locationData.lng}`);
                  
                  coordinates = {
                    lat: parseFloat(locationData.lat),
                    lng: parseFloat(locationData.lng)
                  };
                  
                  // If we don't already have a venue name, use the coordinates
                  if (locationName === "TBA") {
                    locationName = `${parseFloat(locationData.lat).toFixed(2)}, ${parseFloat(locationData.lng).toFixed(2)}`;
                    console.log(`TrendingEvents - Using coordinates as location: ${locationName}`);
                  }
                } else {
                  console.log('TrendingEvents - Invalid or missing coordinates in locationData');
                }
              } catch (error) {
                console.error("TrendingEvents - Error parsing location data:", error);
                console.log('TrendingEvents - Raw location data:', locationField);
              }
            } else {
              console.log('TrendingEvents - No location data available');
            }
            
            console.log(`TrendingEvents - Final location name: ${locationName}`);
            
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
          console.error("Failed to fetch events:", response.error);
          toast.error("Failed to load events. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Error loading events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    console.log(`Navigating to trending event ${eventId}`);
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
            console.log(`Rendering trending event with key: ${eventKey}`, event);
            
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