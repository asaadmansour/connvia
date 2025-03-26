// src/components/events/FilterBar.jsx
import PropTypes from 'prop-types';
import styles from '../pages/Events.module.css';

const FilterBar = ({ contentType, showFilters, onContentTypeChange, onToggleFilters }) => {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterContainer}>
        <div className={styles.filterLabel}>
          <svg
            className={styles.filterIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter by:
        </div>
        <div className={styles.filterButtonsContainer}>
          <button
            type="button"
            className={`${styles.filterButton} ${
              contentType === "events" ? styles.filterButtonActive : styles.filterButtonInactive
            }`}
            onClick={() => onContentTypeChange("events")}
          >
            Events
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${
              contentType === "venues" ? styles.filterButtonActive : styles.filterButtonInactive
            }`}
            onClick={() => onContentTypeChange("venues")}
          >
            Venues
          </button>
        </div>
        <button 
          className={styles.advancedFilterButton}
          onClick={onToggleFilters}
        >
          {showFilters ? "Hide Filters" : "Advanced Filters"}
          <svg
            className={styles.chevronIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={showFilters ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

FilterBar.propTypes = {
  contentType: PropTypes.string.isRequired,
  showFilters: PropTypes.bool.isRequired,
  onContentTypeChange: PropTypes.func.isRequired,
  onToggleFilters: PropTypes.func.isRequired
};

export default FilterBar;