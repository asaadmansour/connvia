import PropTypes from "prop-types";
import styles from "./EventCard.module.css";

function EventCard({ event, onClick }) {
  // Log the event data for debugging
  console.log('EventCard received event:', {
    id: event.id,
    title: event.title,
    location: event.location,
    venue: event.venue,
    formattedDate: event.formattedDate,
    date: event.date
  });
  
  // Determine the location to display
  const displayLocation = event.location || event.venue || "TBA";
  console.log(`EventCard displaying location: ${displayLocation}`);
  
  return (
    <div
      className={styles.eventCard}
      onClick={() => onClick(event.id)}
    >
      <img
        src={event.image}
        alt={event.title}
        className={styles.eventImage}
      />
      <div className={styles.eventContent}>
        <span className={styles.eventCategory}>{event.category}</span>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <div className={styles.priceTag}>{!event.price ? "Free" : `${event.price} EGP`}</div>
        <div className={styles.eventDetail}>
          <span className={styles.eventDetailIcon}>
            <svg
              className={styles.detailIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {event.formattedDate || event.date}
          </span>
        </div>
        <div className={styles.eventDetail}>
          <span className={styles.eventDetailIcon}>
            <span role="img" aria-label="location" style={{ marginRight: '0.25rem' }}>📍</span>
            {displayLocation}
          </span>
        </div>
      </div>
    </div>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    category: PropTypes.string,
    date: PropTypes.string,
    formattedDate: PropTypes.string,
    location: PropTypes.string,
    venue: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default EventCard;