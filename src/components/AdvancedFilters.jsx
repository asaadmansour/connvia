import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import styles from '../pages/Events.module.css';
import { eventTypes, venueTypes, locations, sortOptions } from '../reducers/eventsReducer';

const AdvancedFilters = ({ state, dispatch }) => {
  const { 
    priceRange, 
    ratingFilter, 
    selectedEventTypes, 
    selectedVenueTypes, 
    selectedLocations,
    sortOption, 
    contentType 
  } = state;

  // Handle price range changes
  const handlePriceChange = (e, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = Number(e.target.value);
    dispatch({ type: 'SET_PRICE_RANGE', payload: newPriceRange });
  };

  // Handle rating filter changes
  const handleRatingChange = (rating) => {
    dispatch({ type: 'SET_RATING_FILTER', payload: rating });
  };

  // Handle event type selection
  const handleEventTypeChange = (eventType) => {
    dispatch({ type: 'TOGGLE_EVENT_TYPE', payload: eventType });
  };

  // Handle venue type selection
  const handleVenueTypeChange = (venueType) => {
    dispatch({ type: 'TOGGLE_VENUE_TYPE', payload: venueType });
  };

  // Handle location selection
  const handleLocationChange = (location) => {
    dispatch({ type: 'TOGGLE_LOCATION', payload: location });
  };

  // Handle sort option changes
  const handleSortChange = (e) => {
    dispatch({ type: 'SET_SORT_OPTION', payload: e.target.value });
  };

  // Reset all filters
  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  return (
    <motion.div 
      className={styles.filterSidebar}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.filterSidebarHeader}>
        <h3>Refine Results</h3>
        <button 
          className={styles.resetButton}
          onClick={resetFilters}
        >
          Reset All
        </button>
      </div>
      
      {/* Sort options */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterGroupTitle}>Sort By</h4>
        <select 
          className={styles.sortSelect}
          value={sortOption}
          onChange={handleSortChange}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Price range filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterGroupTitle}>Price Range (EGP)</h4>
        <div className={styles.priceInputs}>
          <input
            type="number"
            min="0"
            max="500"
            value={priceRange[0]}
            onChange={(e) => handlePriceChange(e, 0)}
            className={styles.priceInput}
          />
          <span>to</span>
          <input
            type="number"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(e, 1)}
            className={styles.priceInput}
          />
        </div>
        <div className={styles.rangeSliderContainer}>
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[0]}
            onChange={(e) => handlePriceChange(e, 0)}
            className={styles.rangeSlider}
          />
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(e, 1)}
            className={styles.rangeSlider}
          />
        </div>
      </div>
      
      {/* Rating filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterGroupTitle}>Minimum Rating</h4>
        <div className={styles.ratingButtons}>
          {[0, 3, 3.5, 4, 4.5].map(rating => (
            <button
              key={rating}
              className={`${styles.ratingButton} ${
                ratingFilter === rating ? styles.ratingButtonActive : ""
              }`}
              onClick={() => handleRatingChange(rating)}
            >
              {rating === 0 ? "Any" : `${rating}+`}
              {rating > 0 && (
                <span className={styles.starIcon}>★</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Event type filter - only show for events */}
      {contentType === "events" && (
        <div className={styles.filterGroup}>
          <h4 className={styles.filterGroupTitle}>Event Type</h4>
          <div className={styles.checkboxGroup}>
            {eventTypes.map(type => (
              <label key={type} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedEventTypes.includes(type)}
                  onChange={() => handleEventTypeChange(type)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      {/* Venue type filter - only show for venues */}
      {contentType === "venues" && (
        <div className={styles.filterGroup}>
          <h4 className={styles.filterGroupTitle}>Venue Type</h4>
          <div className={styles.checkboxGroup}>
            {venueTypes.map(type => (
              <label key={type} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedVenueTypes.includes(type)}
                  onChange={() => handleVenueTypeChange(type)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Location filter - show for both events and venues */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterGroupTitle}>Location</h4>
        <div className={styles.checkboxGroup}>
          {locations.map(location => (
            <label key={location} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedLocations.includes(location)}
                onChange={() => handleLocationChange(location)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{location}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

AdvancedFilters.propTypes = {
  state: PropTypes.shape({
    priceRange: PropTypes.arrayOf(PropTypes.number).isRequired,
    ratingFilter: PropTypes.number.isRequired,
    selectedEventTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedVenueTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
    sortOption: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired
  }).isRequired,
  dispatch: PropTypes.func.isRequired
};

export default AdvancedFilters;