// src/components/events/EventsGrid.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../pages/Events.module.css';
import EventCard from './EventCard';
import { filterEvents, sortEvents } from '../reducers/eventsReducer';

const EventsGrid = ({ state, showFilters, onEventClick }) => {
  const { contentType, isLoading, events } = state;
  
  // Filter and sort events
  const filteredEvents = filterEvents(state.events, state);
  const sortedEvents = sortEvents(filteredEvents, state.sortOption);

  return (
    <div className={`${styles.eventsSection} ${showFilters ? styles.eventsSectionWithSidebar : ""}`}>
      <div className={styles.eventsContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <p>Loading events...</p>
          </div>
        ) : (
          <>
            <div className={styles.resultsHeader}>
              <p className={styles.resultsCount}>
                {sortedEvents.length} {contentType === "venues" ? (sortedEvents.length === 1 ? "venue" : "venues") : (sortedEvents.length === 1 ? "event" : "events")} found
              </p>
            </div>
            {events.length > 0 ? (
              <div className={styles.eventsGrid}>
                {sortedEvents.map((event, index) => {
                  // Create a truly unique key using index as fallback
                  const uniqueKey = event.id || event.event_ID || `event-index-${index}`;
                  console.log('Event data:', event);
                  console.log('Using key:', uniqueKey);
                  
                  return (
                    <EventCard
                      key={uniqueKey}
                      event={event}
                      onClick={() => onEventClick(event.id || event.event_ID)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className={styles.noEventsMessage}>
                <p>No {contentType} found. Try a different search or filter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

EventsGrid.propTypes = {
  state: PropTypes.shape({
    events: PropTypes.array.isRequired,
    contentType: PropTypes.string.isRequired,
    sortOption: PropTypes.string.isRequired,
    isLoading: PropTypes.bool
  }).isRequired,
  showFilters: PropTypes.bool.isRequired,
  onEventClick: PropTypes.func.isRequired
};

export default EventsGrid;