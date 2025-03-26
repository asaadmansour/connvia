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

const Events = () => {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const { 
    showFilters, 
    contentType 
  } = state;

  useEffect(() => {
    console.log("Events component mounted (Page Reload Detected)");
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

        {/* Events grid */}
        <EventsGrid 
          state={state}
          showFilters={showFilters}
          onEventClick={(eventId) => console.log(`Navigating to details for event ${eventId}`)}
        />
      </div>
    </div>
  );
};

export default Events;
