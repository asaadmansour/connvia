// src/reducers/eventsReducer.js

// Define reducer function
export function eventsReducer(state, action) {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_ACTIVE_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'TOGGLE_FILTERS':
      return { ...state, showFilters: !state.showFilters };
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };
    case 'SET_RATING_FILTER':
      return { ...state, ratingFilter: action.payload };
    case 'TOGGLE_EVENT_TYPE':
      return { 
        ...state, 
        selectedEventTypes: state.selectedEventTypes.includes(action.payload)
          ? state.selectedEventTypes.filter(type => type !== action.payload)
          : [...state.selectedEventTypes, action.payload]
      };
    case 'TOGGLE_VENUE_TYPE':
      return { 
        ...state, 
        selectedVenueTypes: state.selectedVenueTypes.includes(action.payload)
          ? state.selectedVenueTypes.filter(type => type !== action.payload)
          : [...state.selectedVenueTypes, action.payload]
      };
    case 'TOGGLE_LOCATION':
      return { 
        ...state, 
        selectedLocations: state.selectedLocations.includes(action.payload)
          ? state.selectedLocations.filter(loc => loc !== action.payload)
          : [...state.selectedLocations, action.payload]
      };
    case 'SET_SORT_OPTION':
      return { ...state, sortOption: action.payload };
    case 'SET_CONTENT_TYPE':
      return { 
        ...state, 
        contentType: action.payload,
        // Open filters automatically when switching between events and venues
        showFilters: true,
        // Reset other filters
        activeFilter: "All",
        selectedEventTypes: [],
        selectedVenueTypes: [],
        selectedLocations: []
      };
    case 'RESET_FILTERS':
      return { 
        ...state,
        activeFilter: "All",
        priceRange: [0, 500], // Updated maximum to 500
        ratingFilter: 0,
        selectedEventTypes: [],
        selectedVenueTypes: [],
        selectedLocations: [],
        sortOption: "price_low_high"
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

// Initial state
export const initialState = {
  events: [],
  searchTerm: "",
  activeFilter: "All",
  showFilters: false,
  priceRange: [0, 500],
  ratingFilter: 0,
  selectedEventTypes: [],
  selectedVenueTypes: [],
  selectedLocations: [],
  sortOption: "price_low_high",
  contentType: "events", // "events" or "venues"
  isLoading: true,
  error: null
};

// Event types and venue types for filters
export const eventTypes = ["Conference", "Festival", "Exhibition", "Networking", "Showcase", "Workshop", "Concert"];
export const venueTypes = [
  "Convention Center",
  "Outdoor",
  "Museum",
  "Hotel",
  "Cultural Center",
  "Theater",
  "University",
];

// Locations for filtering
export const locations = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Sharm El Sheikh",
  "Hurghada",
  "Luxor",
  "Aswan",
  "Dahab",
  "Marsa Alam",
  "Port Said",
];

// Sort options
export const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "rating_high_low", label: "Rating: High to Low" },
  { value: "date_upcoming", label: "Date: Upcoming" },
];

// Helper functions for filtering and sorting
export function filterEvents(events, state) {
  if (!events || !events.length) return [];

  const {
    searchTerm,
    activeFilter,
    priceRange,
    ratingFilter,
    selectedEventTypes,
    selectedVenueTypes,
    selectedLocations,
    contentType,
  } = state;

  // Apply search filter
  let filtered = [...events];
  if (searchTerm.trim()) {
    const search = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        (item.category && item.category.toLowerCase().includes(search)) ||
        (item.location && item.location.toLowerCase().includes(search)) ||
        (item.description && item.description.toLowerCase().includes(search))
    );
  }

  // Apply active category filter
  if (activeFilter && activeFilter !== "All") {
    filtered = filtered.filter(
      (item) => item.category === activeFilter
    );
  }

  // Apply price range filter if price exists
  filtered = filtered.filter(
    (item) => !item.price || (item.price >= priceRange[0] && item.price <= priceRange[1])
  );

  // Apply rating filter if rating exists
  if (ratingFilter > 0) {
    filtered = filtered.filter((item) => !item.rating || item.rating >= ratingFilter);
  }

  // Apply event type filters if eventType exists
  if (selectedEventTypes.length > 0 && contentType === "events") {
    filtered = filtered.filter((item) =>
      !item.eventType || selectedEventTypes.includes(item.eventType)
    );
  }

  // Apply venue type filters if venueType exists
  if (selectedVenueTypes.length > 0) {
    filtered = filtered.filter((item) =>
      !item.venueType || selectedVenueTypes.includes(item.venueType)
    );
  }

  // Apply location filters if location exists
  if (selectedLocations.length > 0) {
    filtered = filtered.filter((item) =>
      !item.location || selectedLocations.some((loc) => item.location.includes(loc))
    );
  }

  return filtered;
}

export function sortEvents(events, sortOption) {
  if (!events || !events.length) return [];

  const sorted = [...events];

  switch (sortOption) {
    case "price_low_high":
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price_high_low":
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "rating_high_low":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "date_upcoming":
      return sorted.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date();
        const dateB = b.date ? new Date(b.date) : new Date();
        return dateA - dateB;
      });
    case "relevance":
    default:
      return sorted;
  }
}