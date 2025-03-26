import PropTypes from "prop-types";
import styles from "./EventCard.module.css";

function EventCard({ event, onClick }) {
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
            {event.date}
          </span>
        </div>
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {event.location}
          </span>
        </div>
      </div>
    </div>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default EventCard;