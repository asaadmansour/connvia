import { useReducer, useEffect } from "react";
import styles from "./Events.module.css";
import PageNav from "../components/PageNav";
import HeaderNav from "../components/HeaderNav";
import Section from "../components/Section";
import EventsHero from "../components/EventsHero";
import FilterBar from "../components/FilterBar";
import AdvancedFilters from "../components/AdvancedFilters";
import EventsGrid from "../components/EventsGrid";
import { eventsReducer, initialState } from "../reducers/eventsReducer";
import { getAllEvents } from "../utils/eventService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Events = () => {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const { 
    showFilters, 
    contentType,
    isLoading,
    error
  } = state;

  useEffect(() => {
    // Fetch events from API when component mounts
    const fetchEvents = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await getAllEvents();
        
        if (response.success && response.data && response.data.events) {
          // Transform events to match the expected structure in the Events page
          const formattedEvents = response.data.events.map(event => {
            // Format date properly
            let formattedDate = "TBA";
            
            // Check for start_date field (primary date field in the event table)
            if (event.start_date) {
              try {
                // Parse the date string into a Date object
                const eventDate = new Date(event.start_date);
                
                // Validate that we have a valid date
                if (!isNaN(eventDate.getTime())) {
                  // Format the date in a user-friendly way
                  formattedDate = eventDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                  
                  // Add time if available
                  if (event.start_time) {
                    formattedDate += ` at ${event.start_time}`;
                  }
                }
              } catch (error) {
                /* log removed */
              }
            }
            
            // Get venue location
            let locationName = "TBA";
            let coordinates = null;
            
            // Log raw event data for debugging
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
                
                // Log the location data for debugging
                /* log removed */
                
                // Check if we have valid coordinates
                if (locationData && locationData.lat && locationData.lng) {
                  /* log removed */
                  
                  // Store the coordinates for potential use in a map view
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
              rating: 4.5, // Default rating since we don't have ratings in the database yet
              description: event.description,
              eventType: event.category_name || "Event", // Using category as event type for now
              isVenue: false,
              coordinates: coordinates // Use the coordinates we parsed above
            };
          });
          
          dispatch({ type: 'SET_EVENTS', payload: formattedEvents });
        } else {
          /* log removed */
          dispatch({ type: 'SET_ERROR', payload: response.error || "Failed to load events" });
          toast.error("Failed to load events. Please try again later.");
        }
      } catch (error) {
        /* log removed */
        dispatch({ type: 'SET_ERROR', payload: error.message || "Error loading events" });
        toast.error("Error loading events. Please try again later.");
      }
    };

    fetchEvents();
  }, []);

  // Toggle filter sidebar
  const toggleFilters = () => {
    dispatch({ type: 'TOGGLE_FILTERS' });
  };

  // Handle content type change (events/venues)
  const handleContentTypeChange = (type) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: type });
  };

  return (
    <div className={styles.homeContainer}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <PageNav />
      <Section id="events-section" type="events">
        <HeaderNav bgColor="transparent" />
        <EventsHero 
          searchTerm={state.searchTerm}
          onSearchChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
        />
      </Section>

      {/* Filter section */}
      <FilterBar 
        contentType={contentType}
        showFilters={showFilters}
        onContentTypeChange={handleContentTypeChange}
        onToggleFilters={toggleFilters}
      />

      {/* Main content with sidebar filters and events grid */}
      <div className={styles.mainContent}>
        {/* Advanced filters sidebar */}
        {showFilters && (
          <AdvancedFilters 
            state={state}
            dispatch={dispatch}
          />
        )}

        {/* Error message */}
        {error && !isLoading && (
          <div className={styles.errorMessage}>
            <p>Failed to load events: {error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* Events grid */}
        <EventsGrid 
          state={state}
          showFilters={showFilters}
          onEventClick={(eventId) => /* log removed */}
        />
      </div>
    </div>
  );
};

export default Events;
