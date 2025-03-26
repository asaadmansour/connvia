// src/reducers/eventsReducer.js

// Define reducer function
export function eventsReducer(state, action) {
  switch (action.type) {
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
    default:
      return state;
  }
}

// Initial state
export const initialState = {
  events: [
    {
      id: 1,
      title: "Cairo Tech Summit",
      image:
        "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg",
      category: "Technology",
      date: "March 25, 2025",
      location: "Cairo International Convention Center",
      price: 150,
      rating: 4.8,
      eventType: "Conference",
      venueType: "Convention Center",
      isVenue: false,
    },
    {
      id: 2,
      title: "Egyptian Food Festival",
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      category: "Food & Drink",
      date: "April 10-12, 2025",
      location: "Alexandria Corniche",
      price: 75,
      rating: 4.5,
      eventType: "Festival",
      venueType: "Outdoor",
      isVenue: false,
    },
    {
      id: 3,
      title: "Luxor Cultural Exhibition",
      image:
        "https://images.pexels.com/photos/3937174/pexels-photo-3937174.jpeg",
      category: "Arts & Culture",
      date: "April 5, 2025",
      location: "Luxor Museum",
      price: 60,
      rating: 4.7,
      eventType: "Exhibition",
      venueType: "Museum",
      isVenue: false,
    },
    {
      id: 4,
      title: "Business Networking Forum",
      image:
        "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
      category: "Business",
      date: "March 30, 2025",
      location: "Marriott Hotel, Cairo",
      price: 200,
      rating: 4.3,
      eventType: "Networking",
      venueType: "Hotel",
      isVenue: false,
    },
    {
      id: 5,
      title: "Nile Music Festival",
      image:
        "https://images.pexels.com/photos/2747441/pexels-photo-2747441.jpeg",
      category: "Music",
      date: "April 18, 2025",
      location: "Aswan Cultural Center",
      price: 120,
      rating: 4.9,
      eventType: "Festival",
      venueType: "Cultural Center",
      isVenue: false,
    },
    {
      id: 6,
      title: "Egyptian Film Showcase",
      image:
        "https://images.pexels.com/photos/9439246/pexels-photo-9439246.jpeg",
      category: "Film & Media",
      date: "April 2-8, 2025",
      location: "El Gouna Film Center",
      price: 90,
      rating: 4.6,
      eventType: "Showcase",
      venueType: "Theater",
      isVenue: false,
    },
    {
      id: 7,
      title: "Cairo Opera House",
      image:
        "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
      category: "Arts & Culture",
      location: "Cairo Opera House Complex, Gezira",
      price: 0,
      rating: 4.9,
      venueType: "Theater",
      capacity: 1200,
      amenities: ["Parking", "Restaurant", "Accessibility"],
      isVenue: true,
    },
  ],
  searchTerm: "",
  activeFilter: "All",
  showFilters: false,
  priceRange: [0, 500], // Updated maximum to 500
  ratingFilter: 0,
  selectedEventTypes: [],
  selectedVenueTypes: [],
  selectedLocations: [],
  sortOption: "price_low_high",
  contentType: "events", // "events" or "venues"
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
export const locations = ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Hurghada", "Sharm El Sheikh"];

// Sort options
export const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "rating_high_low", label: "Rating: High to Low" },
  { value: "date_upcoming", label: "Date: Upcoming" },
];

// Helper functions for filtering and sorting
export const filterEvents = (events, state) => {
  const { 
    searchTerm, 
    activeFilter, 
    priceRange, 
    ratingFilter, 
    selectedEventTypes, 
    selectedVenueTypes, 
    selectedLocations,
    contentType 
  } = state;

  return events.filter((event) => {
    // Filter by content type (events/venues)
    const matchesContentType = 
      (contentType === "events" && !event.isVenue) || 
      (contentType === "venues" && event.isVenue);
    
    // If no match on content type, return false immediately
    if (!matchesContentType) return false;
    
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory =
      activeFilter === "All" || event.category === activeFilter;
    
    const matchesPrice = 
      event.price >= priceRange[0] && event.price <= priceRange[1];
    
    const matchesRating = 
      ratingFilter === 0 || event.rating >= ratingFilter;
    
    const matchesEventType = 
      selectedEventTypes.length === 0 || 
      (event.eventType && selectedEventTypes.includes(event.eventType));
    
    const matchesVenueType = 
      selectedVenueTypes.length === 0 || 
      selectedVenueTypes.includes(event.venueType);

    const matchesLocation =
      selectedLocations.length === 0 ||
      (event.location && selectedLocations.some(loc => event.location.includes(loc)));

    return matchesSearch && matchesCategory && matchesPrice && 
           matchesRating && matchesEventType && matchesVenueType && matchesLocation;
  });
};

export const sortEvents = (events, sortOption) => {
  return [...events].sort((a, b) => {
    switch (sortOption) {
      case "price_low_high":
        return a.price - b.price;
      case "price_high_low":
        return b.price - a.price;
      case "rating_high_low":
        return b.rating - a.rating;
      case "date_upcoming":
        return new Date(a.date) - new Date(b.date);
      default:
        return 0;
    }
  });
};