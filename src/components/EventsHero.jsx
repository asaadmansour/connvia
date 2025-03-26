// src/components/events/EventsHero.jsx
import PropTypes from 'prop-types';
import styles from '../pages/Events.module.css';
import Video from './Video';

const EventsHero = ({ searchTerm, onSearchChange }) => {
  return (
    <div className={styles.heroSection}>
      <div className={styles.videoContainer}>
        <Video />
        <div className={styles.videoOverlay}></div>
      </div>
      <h1 className={styles.heroTitle}>Discover Amazing Events in Egypt</h1>
      <p className={styles.heroDescription}>
        Find the best events happening across Egypt, from cultural
        exhibitions to tech conferences and music festivals.
      </p>
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <div className={styles.searchIconContainer}>
            <svg
              className={styles.searchIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for events by name or location..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

EventsHero.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired
};

export default EventsHero;