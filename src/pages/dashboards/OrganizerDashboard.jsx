import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logoutUser, getToken } from "../../utils/authService";
import { getAvailableVenues } from "../../utils/venueService";
import {
  getCategories,
  getSubcategoriesByCategoryId,
} from "../../utils/categoryService";
import { createReservation } from "../../utils/reservationService";
import { getOrganizerEvents } from "../../utils/eventService";
import { getOrganizerStats } from "../../utils/dashboardService";
import DashboardHeader from "../../components/DashboardHeader";
import EventModal from "../../components/modals/EventModal";
import styles from "./VenueDashboard.module.css";
import VenueOwnerModal from "../../components/modals/VenueOwnerModal";
import axios from "axios";
import "./VenueImageFix.css"; // Import CSS for fixing inconsistent image sizes

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Mock data for the dashboard
const mockData = {
  earnings: {
    total: 8750,
    percentChange: 8.3,
    isPositive: true,
  },
  events: {
    upcoming: 3,
    total: 5,
  },
  bookings: {
    total: 67,
    pendingCount: 12,
  },
  vendorRequests: {
    pending: 8,
  },
  vendorRequestsList: [
    {
      id: 1,
      vendorName: "Gourmet Catering Services",
      eventId: 1,
      eventName: "Tech Conference 2025",
      services: ["Food & Beverage", "Staff"],
      requestDate: "2025-03-20",
      status: "Pending",
    },
    {
      id: 2,
      vendorName: "Sound Masters",
      eventId: 2,
      eventName: "Summer Music Festival",
      services: ["Audio Equipment", "Technicians"],
      requestDate: "2025-03-22",
      status: "Pending",
    },
    {
      id: 3,
      vendorName: "Decor Experts",
      eventId: 1,
      eventName: "Tech Conference 2025",
      services: ["Stage Setup", "Decorations"],
      requestDate: "2025-03-18",
      status: "Pending",
    },
  ],
  notifications: [
    {
      id: 1,
      message: "New vendor application for Tech Conference",
      time: "10m ago",
      isNew: true,
    },
    {
      id: 2,
      message: "25 new tickets sold for Summer Music Festival",
      time: "1h ago",
      isNew: true,
    },
    {
      id: 3,
      message: "Vendor Sound Masters confirmed for Music Festival",
      time: "3h ago",
      isNew: false,
    },
    {
      id: 4,
      message: "Payment confirmation for venue reservation",
      time: "5h ago",
      isNew: false,
    },
  ],
};

function OrganizerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showReserveVenueModal, setShowReserveVenueModal] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [availableVenues, setAvailableVenues] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [formattedLocation, setFormattedLocation] = useState(
    "No address available"
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    categoryId: "",
    subcategoryId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    attendees: "",
    selectedPricingOption: "hourly",
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    eventsCount: 0,
    upcomingEvents: 0,
    ticketsSold: 0,
    pendingPayments: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const newNotificationsCount = mockData.notifications.filter(
    (n) => n.isNew
  ).length;

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await getOrganizerStats();
      /* log removed */

      if (response.success && response.data) {
        setDashboardStats(response.data);
      } else {
        /* log removed */
        toast.error("Failed to load dashboard statistics");
      }
    } catch (error) {
      /* log removed */
      toast.error("Error loading dashboard statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch user's events and dashboard stats when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getOrganizerEvents();
        /* log removed */

        if (response.success) {
          if (response.data && response.data.length > 0) {
            setUserEvents(response.data);
            /* log removed */
          } else {
            /* log removed */
            setUserEvents([]);
          }
        } else {
          /* log removed */
          setUserEvents([]);
        }
      } catch (error) {
        /* log removed */
        setUserEvents([]);
      }
    };

    fetchEvents();
    fetchDashboardStats();
  }, []);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);

      try {
        const response = await getCategories();

        if (response.success && response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          /* log removed */
        }
      } catch (error) {
        /* log removed */
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when selected category changes
  useEffect(() => {
    if (!eventDetails.categoryId) {
      setSubcategories([]);
      return;
    }

    const fetchSubcategories = async () => {
      setIsLoadingSubcategories(true);

      try {
        const response = await getSubcategoriesByCategoryId(
          eventDetails.categoryId
        );

        if (response.success && response.data && response.data.subcategories) {
          setSubcategories(response.data.subcategories);

          // Reset subcategory selection when category changes
          setEventDetails((prev) => ({
            ...prev,
            subcategoryId: "",
          }));
        } else {
          /* log removed */
        }
      } catch (error) {
        /* log removed */
      } finally {
        setIsLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [eventDetails.categoryId]);

  // Fetch available venues
  useEffect(() => {
    const fetchAvailableVenues = async () => {
      setIsLoadingVenues(true);
      setVenueError(null);

      try {
        const response = await getAvailableVenues();
        /* log removed */
        /* log removed */

        if (response.success && response.data && response.data.venues) {
          // Log each venue's image URL
          response.data.venues.forEach((venue) => {
            /* log removed */
          });

          setAvailableVenues(response.data.venues);
        } else {
          setVenueError(response.error || "Failed to fetch available venues");
        }
      } catch (error) {
        /* log removed */
        setVenueError("An unexpected error occurred while fetching venues");
      } finally {
        setIsLoadingVenues(false);
      }
    };

    fetchAvailableVenues();
  }, []);

  // Add debug effect
  useEffect(() => {
    if (selectedOwner) {
      /* log removed */
    }
  }, [selectedOwner]);

  // Check URL parameters for payment status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");
    const reservationId = params.get("reservation");

    const updatePaymentStatus = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("authToken");

        if (!token) {
          /* log removed */
          return;
        }

        /* log removed */
        /* log removed */
        /* log removed */

        const newStatus = paymentStatus === "success" ? "paid" : "cancelled";

        const response = await axios.patch(
          `https://connviabackend-production.up.railway.app/api/reservations/${reservationId}/payment`,
          {
            paymentStatus: newStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        /* log removed */
      } catch (error) {
        /* log removed */
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          /* log removed */
          /* log removed */
          /* log removed */

          if (error.response.status === 403) {
            /* log removed */
            // Optionally alert the user
            // alert("Your session has expired. Please log in again.");
            // navigate("/login");
          }
        } else if (error.request) {
          // The request was made but no response was received
          /* log removed */
        } else {
          // Something happened in setting up the request that triggered an Error
          /* log removed */
        }
      }
    };

    if (paymentStatus && reservationId) {
      updatePaymentStatus();
    }

    if (paymentStatus === "success") {
      setShowPaymentSuccess(true);
      // Remove the query parameters from URL without page reload
      navigate("/dashboards/organizer", { replace: true });
      // Auto-hide the success modal after 3 seconds
      setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 3000);
    } else if (paymentStatus === "cancelled") {
      setShowPaymentError(true);
      // Remove the query parameters from URL without page reload
      navigate("/dashboards/organizer", { replace: true });
    }
  }, [location, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  /**
   * Toggle the create event modal
   */
  const toggleCreateEventModal = () => {
    setShowCreateEventModal(!showCreateEventModal);
  };

  /**
   * Handle creating a new event
   */
  // Function to fetch events using the existing getOrganizerEvents function
  const fetchEvents = async () => {
    try {
      const response = await getOrganizerEvents();
      /* log removed */

      if (response.success) {
        if (response.data && response.data.length > 0) {
          setUserEvents(response.data);
          /* log removed */
        } else {
          /* log removed */
          setUserEvents([]);
        }
      } else {
        /* log removed */
        toast.error(`Failed to fetch events: ${response.error}`);
        setUserEvents([]);
      }
    } catch (error) {
      /* log removed */
      toast.error(`Error fetching events: ${error.message}`);
      setUserEvents([]);
    }
  };

  const handleCreateEvent = async (formData) => {
    try {
      // Log that we're creating an event with FormData
      /* log removed */

      // Get the token using the proper method from authService
      const token = getToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      // Make a direct fetch request to the API with FormData
      // This is similar to how venues are handled
      const response = await fetch(
        "https://connviabackend-production.up.railway.app/api/events",
        {
          method: "POST",
          headers: {
            // Don't set Content-Type with FormData - browser will set it automatically
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Event created successfully!");
        // Refresh events list
        fetchEvents();
      } else {
        /* log removed */
        toast.error(
          `Failed to create event: ${
            data.error || data.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      /* log removed */
      toast.error(`Error creating event: ${error.message}`);
    }
  };

  /**
   * Toggle the reserve venue modal
   */
  const toggleReserveVenueModal = () => {
    setShowReserveVenueModal(!showReserveVenueModal);
  };

  const handleApproveVendor = (vendorId) => {
    // Mock function to approve vendor - would be replaced with actual API call
    /* log removed */
    // Update UI after approval
  };

  const handleDeclineVendor = (vendorId) => {
    // Mock function to decline vendor - would be replaced with actual API call
    /* log removed */
    // Update UI after declining
  };

  // Find a venue by ID, trying different possible ID field names
  const findVenueById = (venueId) => {
    /* log removed */
    /* log removed */

    // Try multiple ID fields and handle both string and number comparisons
    return availableVenues.find((v) => {
      // Some venues might use id, others venue_ID, handle both cases
      if (v.id !== undefined && String(v.id) === String(venueId)) {
        return true;
      }
      if (v.venue_ID !== undefined && String(v.venue_ID) === String(venueId)) {
        return true;
      }
      return false;
    });
  };

  /**
   * Function to fetch location name from coordinates
   */
  const fetchLocationName = async (lat, lng) => {
    setIsLoadingLocation(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );

      if (response.data && response.data.display_name) {
        // Extract a more concise location name
        const address = response.data.address;
        let placeName = "";

        if (address.road) placeName += address.road;
        if (address.suburb)
          placeName += placeName ? `, ${address.suburb}` : address.suburb;
        if (address.city)
          placeName += placeName ? `, ${address.city}` : address.city;
        if (address.country)
          placeName += placeName ? `, ${address.country}` : address.country;

        setFormattedLocation(placeName || response.data.display_name);
      } else {
        setFormattedLocation("No address details available");
      }
    } catch (error) {
      /* log removed */
      setFormattedLocation("Location information unavailable");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  /**
   * Handle venue selection and fetch location data
   */
  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);

    // Parse location and fetch address
    try {
      let coordinates;
      if (venue.location && typeof venue.location === "string") {
        coordinates = JSON.parse(venue.location);
      } else if (venue.location) {
        coordinates = venue.location;
      }

      if (coordinates && coordinates.lat && coordinates.lng) {
        fetchLocationName(coordinates.lat, coordinates.lng);
      } else {
        setFormattedLocation("No location coordinates available");
      }
    } catch (error) {
      /* log removed */
      setFormattedLocation("Location information unavailable");
    }

    setShowReserveVenueModal(true);
  };

  /**
   * Close the reserve venue modal
   */
  const closeReserveVenueModal = () => {
    setShowReserveVenueModal(false);

    // Reset form values with slight delay to ensure animations complete
    setTimeout(() => {
      setSelectedVenue(null);
      // Also reset subcategories and event details
      setSubcategories([]);
      setEventDetails({
        categoryId: "",
        subcategoryId: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        attendees: "",
        selectedPricingOption: "hourly",
      });
      setCalculatedPrice(0);
    }, 100);
  };

  // Handle event details changes and recalculate price
  const handleEventDetailsChange = (e) => {
    const { name, value } = e.target;

    // If pricing option is hourly and start date changes, sync end date
    if (
      eventDetails.selectedPricingOption === "hourly" &&
      name === "startDate"
    ) {
      setEventDetails((prev) => ({
        ...prev,
        startDate: value,
        endDate: value, // Set end date equal to start date for hourly option
      }));

      // Recalculate price with updated dates
      calculatePrice({
        ...eventDetails,
        startDate: value,
        endDate: value,
      });
    } else {
      setEventDetails((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Recalculate price after form fields change
      calculatePrice({
        ...eventDetails,
        [name]: value,
      });
    }
  };

  // Handle pricing option change (hourly or daily)
  const handlePricingOptionChange = (option) => {
    // If switching to hourly, make sure end date equals start date
    if (option === "hourly") {
      setEventDetails((prev) => ({
        ...prev,
        selectedPricingOption: option,
        endDate: prev.startDate, // Set end date equal to start date for hourly option
      }));

      // Recalculate price with new pricing option
      setTimeout(() => {
        calculatePrice({
          ...eventDetails,
          selectedPricingOption: option,
          endDate: eventDetails.startDate,
        });
      }, 0);
    } else {
      // For daily option, keep dates as they are
      setEventDetails((prev) => ({
        ...prev,
        selectedPricingOption: option,
      }));

      // Recalculate price with new pricing option
      setTimeout(() => {
        calculatePrice({
          ...eventDetails,
          selectedPricingOption: option,
        });
      }, 0);
    }
  };

  // Calculate price based on event details and selected pricing option
  const calculatePrice = (details) => {
    if (!selectedVenue) return;

    try {
      // Get the current pricing option from the passed details
      const pricingOption = details.selectedPricingOption;
      /* log removed */

      if (pricingOption === "daily") {
        // Daily pricing - calculate based on date range
        if (details.startDate && details.endDate) {
          const startDate = new Date(details.startDate);
          const endDate = new Date(details.endDate);

          // Calculate days difference (including end date)
          if (endDate >= startDate) {
            // Add 1 to include the end date in the calculation
            const daysDiff =
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const dailyRate = parseFloat(selectedVenue.cost_daily) || 0;
            const totalCost = dailyRate * daysDiff;
            /* log removed */
            setCalculatedPrice(totalCost);
          } else {
            // End date is before start date
            setCalculatedPrice(parseFloat(selectedVenue.cost_daily) || 0);
          }
        } else {
          // Not enough data to calculate daily price
          setCalculatedPrice(parseFloat(selectedVenue.cost_daily) || 0);
        }
      } else {
        // Hourly pricing - calculate based on start and end times
        if (details.startTime && details.endTime) {
          let startDateTime, endDateTime;

          if (details.startDate && details.endDate) {
            // If dates are provided, use them
            startDateTime = new Date(
              `${details.startDate}T${details.startTime}`
            );
            endDateTime = new Date(`${details.endDate}T${details.endTime}`);
          } else {
            // If no dates, assume same day
            const today = new Date().toISOString().split("T")[0];
            startDateTime = new Date(`${today}T${details.startTime}`);
            endDateTime = new Date(`${today}T${details.endTime}`);
          }

          // Calculate hours difference
          if (endDateTime > startDateTime) {
            const hoursDiff = (endDateTime - startDateTime) / (1000 * 60 * 60);
            const hourlyRate = parseFloat(selectedVenue.cost_hourly) || 0;
            const totalCost = hourlyRate * hoursDiff;
            /* log removed */
            setCalculatedPrice(totalCost);
          } else {
            // End time is before start time
            setCalculatedPrice(parseFloat(selectedVenue.cost_hourly) || 0);
          }
        } else {
          // Not enough data to calculate hourly price
          setCalculatedPrice(parseFloat(selectedVenue.cost_hourly) || 0);
        }
      }
    } catch (error) {
      /* log removed */
      setCalculatedPrice(parseFloat(selectedVenue.cost_hourly) || 0);
    }
  };

  // State for confirmation modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    // Validate form data
    if (!eventDetails.categoryId) {
      toast.error("Please select an event category");
      return;
    }

    if (!eventDetails.attendees || eventDetails.attendees <= 0) {
      toast.error("Please enter the expected number of attendees");
      return;
    }

    if (eventDetails.selectedPricingOption === "hourly") {
      // For hourly, we need start time and end time
      if (!eventDetails.startTime || !eventDetails.endTime) {
        toast.error("Please select both start and end times");
        return;
      }

      // For hourly, we also need start date (end date will be the same)
      if (!eventDetails.startDate) {
        toast.error("Please select a date");
        return;
      }
    } else {
      // For daily, we need start date and end date
      if (!eventDetails.startDate || !eventDetails.endDate) {
        toast.error("Please select both start and end dates");
        return;
      }
    }

    try {
      // Show confirmation toast instead of window.confirm
      setShowConfirmationModal(true);
      return;
    } catch (error) {
      /* log removed */
      toast.error("An error occurred. Please try again.");
    }
  };

  // Handle confirmed payment after modal confirmation
  const handleConfirmedPayment = async () => {
    setShowConfirmationModal(false);

    try {
      // Create reservation in database
      const reservationData = {
        venueId: selectedVenue.venue_ID || selectedVenue.id,
        subcategoryId: eventDetails.subcategoryId,
        startDate: eventDetails.startDate,
        endDate: eventDetails.endDate,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime,
        attendeesCount: eventDetails.attendees,
        pricingOption: eventDetails.selectedPricingOption,
        totalCost: calculatedPrice,
      };

      /* log removed */

      const response = await createReservation(reservationData);

      /* log removed */

      if (!response.success) {
        /* log removed */

        // Try a direct fetch as a fallback/debug
        /* log removed */
        const token = localStorage.getItem("authToken");

        if (token) {
          try {
            const directResponse = await fetch(
              "https://connviabackend-production.up.railway.app/api/reservations",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(reservationData),
              }
            );

            const directData = await directResponse.json();
            /* log removed */

            if (directResponse.ok && directData.success) {
              /* log removed */
              // Use this response instead
              response.success = true;
              response.data = directData.data;
              response.message = directData.message;
            } else {
              throw new Error(
                directData.error || "Failed with direct API call too"
              );
            }
          } catch (directError) {
            /* log removed */
            throw new Error(response.error || "Failed to create reservation");
          }
        } else {
          throw new Error(response.error || "Failed to create reservation");
        }
      }

      /* log removed */

      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      // Get the checkout URL from your backend
      // Get the token for authorization
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      /* log removed */

      const checkoutResponse = await fetch(
        "https://connviabackend-production.up.railway.app/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add the auth token
          },
          body: JSON.stringify({
            reservationId: response.data.reservationId,
            amount: calculatedPrice,
            venueName: selectedVenue.name,
            description: `${
              eventDetails.selectedPricingOption === "hourly"
                ? "Hourly"
                : "Daily"
            } reservation\nDates: ${eventDetails.startDate || ""} to ${
              eventDetails.endDate || ""
            }\nTime: ${eventDetails.startTime || ""} to ${
              eventDetails.endTime || ""
            }\nAttendees: ${eventDetails.attendees}`,
          }),
        }
      );

      const checkoutData = await checkoutResponse.json();

      if (!checkoutData.success || !checkoutData.url) {
        throw new Error(
          checkoutData.error || "Failed to create checkout session"
        );
      }

      // Close the modal before redirecting
      closeReserveVenueModal();

      // Redirect to Stripe Checkout
      window.location.href = checkoutData.url;
    } catch (error) {
      /* log removed */
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Use the DashboardHeader component with notifications */}
      <DashboardHeader
        handleLogout={handleLogout}
        toggleNotifications={() => /* log removed */}
        showNotifications={false}
        newNotificationsCount={newNotificationsCount}
        notifications={mockData.notifications}
      />

      {/* Main Dashboard Content */}
      <main className={styles.mainContent}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Organizer Dashboard</h1>
            <p className={styles.welcomeText}>
              Welcome back to your event management hub
            </p>
          </div>
          <button
            className={styles.newVenueButton}
            onClick={toggleCreateEventModal}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Create New Event
          </button>
        </div>

        {/* Top Dashboard Cards */}
        <div className={styles.cardsGrid}>
          {/* Total Earnings Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4V20M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Total Revenue
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>
                  EGP {dashboardStats.totalRevenue.toLocaleString()}
                </span>
                {!isLoadingStats && (
                  <span
                    className={`${styles.percentChange} ${styles.percentPositive}`}
                  >
                    {userEvents.length > 0
                      ? "From confirmed tickets"
                      : "No events yet"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Events Count Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                My Events
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>
                  {dashboardStats.eventsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Sales Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 8V12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Ticket Sales
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>
                  {dashboardStats.ticketsSold}
                </span>
              </div>
            </div>
          </div>

          {/* Vendor Requests Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 5H4V21L8 17H20V5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Pending Payments
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>
                  {dashboardStats.pendingPayments}
                </span>
                <span className={styles.percentChange}>Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Action button cards */}
        <div className={styles.actionsList}>
          <button
            className={styles.actionButton}
            onClick={toggleCreateEventModal}
          >
            <span
              className={`${styles.actionIconContainer} ${styles.earningsIcon}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 21H21M3 18H21M5 18V12M19 18V12M9 18V12M15 18V12M3 12H21M7 12V6H17V12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionText}>Reserve Venue</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={toggleCreateEventModal}
          >
            <span
              className={`${styles.actionIconContainer} ${styles.listingsIcon}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 17H15M9 13H15M9 9H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionText}>Create Event</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={() => toggleReserveVenueModal()}
          >
            <span
              className={`${styles.actionIconContainer} ${styles.reportsIcon}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 5H4V21L8 17H20V5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionText}>View Vendor Requests</span>
          </button>
        </div>

        {/* My Events Section */}
        <div className={styles.sectionsGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Events</h2>
              <button
                className={styles.viewAllSectionButton}
                onClick={toggleCreateEventModal}
              >
                Create New Event
              </button>
            </div>

            {userEvents.length > 0 ? (
              <table className={styles.bookingsTable}>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Capacity</th>
                    <th>Tickets Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userEvents.map((event, index) => (
                    <tr key={event.event_ID || index}>
                      <td>
                        <h4 className={styles.bookingTitle}>{event.name}</h4>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {event.start_date
                            ? new Date(event.start_date).toLocaleDateString()
                            : ""}
                        </p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {event.venue_name}
                        </p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {event.venue_capacity ||
                            event.attendees_count ||
                            event.capacity ||
                            "N/A"}
                        </p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {event.tickets_sold || "-"}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`${styles.bookingStatus} ${styles.statusConfirmed}`}
                        >
                          {(() => {
                            const currentTime = new Date();
                            const eventStartDate = new Date(
                              `${event.reservation_date}T${event.start_time}`
                            );
                            const eventEndDate = event.end_date
                              ? new Date(`${event.end_date}T${event.end_time}`)
                              : null;

                            if (eventEndDate && currentTime > eventEndDate) {
                              return "Completed";
                            } else if (currentTime > eventStartDate) {
                              return "In Progress";
                            } else {
                              return "Upcoming";
                            }
                          })()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.noVenuesMessage}>
                <p>
                  You haven&apos;t created any events yet. Click the
                  &quot;Create New Event&quot; button to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Available Venues Section */}
        <div className={styles.sectionsGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Available Venues</h2>
              <button className={styles.viewAllSectionButton}>
                View All Venues
              </button>
            </div>

            {isLoadingVenues ? (
              <div className={styles.loadingContainer}>
                <p>Loading venues...</p>
              </div>
            ) : venueError ? (
              <div className={styles.errorContainer}>
                <p>{venueError}</p>
                <button
                  className={styles.retryButton}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : availableVenues.length > 0 ? (
              <div className={styles.venueGrid}>
                {availableVenues.map((venue, index) => (
                  <div key={index} className={styles.venueCard}>
                    <div className={styles.venueImageContainer}>
                      <img
                        src={(() => {
                          if (!venue.images) {
                            return "https://via.placeholder.com/300x200";
                          }

                          // Extract just the filename from the full URL or comma-separated string
                          const imageUrl = Array.isArray(venue.images)
                            ? venue.images[0]
                            : venue.images;
                          const filename = imageUrl
                            .split("/")
                            .pop()
                            .split(",")[0]
                            .trim();

                          return `https://connviabackend-production.up.railway.app/uploads/venues/${filename}`;
                        })()}
                        alt={venue.name}
                        className={styles.venueImage}
                        onError={(e) => {
                          /* log removed */
                          /* log removed */
                          e.target.src = "https://via.placeholder.com/300x200";
                        }}
                      />
                    </div>
                    <div className={styles.venueInfo}>
                      <div className={styles.venueNameRow}>
                        <h3 className={styles.venueName}>{venue.name}</h3>
                        <p className={styles.venueCategory}>
                          {venue.category || "Venue"}
                        </p>
                      </div>

                      <div className={styles.ownerCapacityRow}>
                        <p className={styles.venueOwner}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <button
                            className={styles.ownerNameLink}
                            onClick={() => {
                              /* log removed */

                              if (venue.venue_owner_ID) {
                                /* log removed */
                                setSelectedOwner(venue.venue_owner_ID);
                              } else {
                                /* log removed */
                                toast.error(
                                  "Could not find venue owner information"
                                );
                              }
                            }}
                          >
                            {venue.ownerName
                              ? venue.ownerName
                                  .replace("TRACEMARKER__", "")
                                  .replace("__ENDMARKER", "")
                              : "Unknown Owner"}
                          </button>
                        </p>

                        <span className={styles.venueCapacity}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          {venue.capacity}
                        </span>
                      </div>

                      {/* Pricing display with brand colors */}
                      <div className={styles.pricingContainer}>
                        {venue.pricing_type === "both" ? (
                          <div className={styles.pricingRow}>
                            <span
                              className={`${styles.pricingOption} ${styles.pricingHourly}`}
                            >
                              {venue.cost_hourly}{" "}
                              <span className={styles.pricingLabel}>EGP/h</span>
                            </span>
                            <span
                              className={`${styles.pricingOption} ${styles.pricingDaily}`}
                            >
                              {venue.cost_daily}{" "}
                              <span className={styles.pricingLabel}>EGP/d</span>
                            </span>
                          </div>
                        ) : venue.pricing_type === "hourly" ? (
                          <div className={styles.pricingRow}>
                            <span
                              className={`${styles.pricingOption} ${styles.pricingHourly}`}
                            >
                              {venue.cost_hourly}{" "}
                              <span className={styles.pricingLabel}>EGP/h</span>
                            </span>
                          </div>
                        ) : (
                          <div className={styles.pricingRow}>
                            <span
                              className={`${styles.pricingOption} ${styles.pricingDaily}`}
                            >
                              {venue.cost_daily}{" "}
                              <span className={styles.pricingLabel}>EGP/d</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={styles.venueActions}>
                        <button className={styles.viewVenueButton}>
                          View Details
                        </button>
                        <button
                          className={styles.reserveVenueButton}
                          onClick={() => {
                            /* log removed */

                            // Pass the entire venue object to handleVenueSelect
                            // This will handle location parsing and display
                            handleVenueSelect(venue);
                          }}
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noVenuesMessage}>
                <p>
                  No available venues found at the moment. Please check back
                  later.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Requests Section */}
        <div className={styles.sectionsGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Vendor Requests</h2>
              <button className={styles.viewAllSectionButton}>
                View All Requests
              </button>
            </div>

            {mockData.vendorRequestsList.length > 0 ? (
              <table className={styles.bookingsTable}>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Event</th>
                    <th>Services</th>
                    <th>Request Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.vendorRequestsList.map((request, index) => (
                    <tr key={index}>
                      <td>
                        <h4 className={styles.bookingTitle}>
                          {request.vendorName}
                        </h4>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {request.eventName}
                        </p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {request.services.join(", ")}
                        </p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {request.requestDate}
                        </p>
                      </td>
                      <td>
                        <div className={styles.vendorRequestActions}>
                          <button
                            className={styles.approveVendorButton}
                            onClick={() => handleApproveVendor(request.id)}
                          >
                            Approve
                          </button>
                          <button
                            className={styles.declineVendorButton}
                            onClick={() => handleDeclineVendor(request.id)}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.noVenuesMessage}>
                <p>No pending vendor requests at this time.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <EventModal
          onClose={toggleCreateEventModal}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {/* Reserve Venue Modal */}
      {showReserveVenueModal && selectedVenue && (
        <div
          className={styles.modalOverlay}
          onClick={() => closeReserveVenueModal()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className={styles.reserveVenueModal}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <div
              className={styles.modalHeader}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 20px",
                borderBottom: "1px solid #eee",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Reserve Venue
              </h2>
              <button
                className={styles.closeModalButton}
                onClick={() => closeReserveVenueModal()}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                &times;
              </button>
            </div>

            <div
              className={styles.modalBody}
              style={{
                padding: "20px",
              }}
            >
              <div
                className={styles.reservationDetails}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  className={styles.venueDetails}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 10px 0",
                      color: "#333",
                    }}
                  >
                    Venue Details
                  </h3>

                  <div
                    className={styles.venueImagePreview}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      overflow: "hidden",
                      marginBottom: "15px",
                    }}
                  >
                    <img
                      src={(() => {
                        if (!selectedVenue.images) {
                          return "https://via.placeholder.com/300x200";
                        }

                        // Extract just the filename from the full URL or comma-separated string
                        const imageUrl = Array.isArray(selectedVenue.images)
                          ? selectedVenue.images[0]
                          : selectedVenue.images;
                        const filename = imageUrl
                          .split("/")
                          .pop()
                          .split(",")[0]
                          .trim();

                        return `https://connviabackend-production.up.railway.app/uploads/venues/${filename}`;
                      })()}
                      alt={selectedVenue.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        /* log removed */
                        e.target.src = "https://via.placeholder.com/300x200";
                      }}
                    />
                  </div>

                  <div
                    className={styles.venueInfo}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "10px 15px",
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "#555" }}>
                      Name:
                    </span>
                    <span style={{ color: "#333" }}>
                      {selectedVenue.name || "Unnamed venue"}
                    </span>

                    <span style={{ fontWeight: "bold", color: "#555" }}>
                      Location:
                    </span>
                    <span style={{ color: "#333" }}>
                      {isLoadingLocation ? (
                        <span style={{ fontStyle: "italic" }}>
                          Fetching location...
                        </span>
                      ) : (
                        formattedLocation
                      )}
                    </span>

                    <span style={{ fontWeight: "bold", color: "#555" }}>
                      Capacity:
                    </span>
                    <span style={{ color: "#333" }}>
                      {selectedVenue.capacity || 0} people
                    </span>

                    <span style={{ fontWeight: "bold", color: "#555" }}>
                      Category:
                    </span>
                    <span style={{ color: "#333" }}>
                      {selectedVenue.category || "General"}
                    </span>

                    <span style={{ fontWeight: "bold", color: "#555" }}>
                      Owner:
                    </span>
                    <span style={{ color: "#333" }}>
                      {(() => {
                        const ownerName =
                          selectedVenue.ownerName || selectedVenue.owner_name;
                        if (typeof ownerName === "string") {
                          // Clean up any special markers that might be in the data
                          return (
                            ownerName
                              .replace("TRACEMARKER__", "")
                              .replace("__ENDMARKER", "") || "Unknown"
                          );
                        }
                        return "Unknown";
                      })()}
                    </span>
                  </div>
                </div>

                <div
                  className={styles.eventDetailsForm}
                  style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 20px 0",
                      color: "#333",
                    }}
                  >
                    Event Details
                  </h3>

                  <div
                    style={{
                      marginBottom: "15px",
                    }}
                  >
                    <label
                      htmlFor="categoryId"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#555",
                      }}
                    >
                      Event Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        backgroundColor: "#fff",
                      }}
                      className={styles.formInput}
                      value={eventDetails.categoryId}
                      onChange={handleEventDetailsChange}
                      disabled={isLoadingCategories}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option
                          key={category.category_ID}
                          value={category.category_ID}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {isLoadingCategories && (
                      <small className={styles.helperText}>
                        Loading categories...
                      </small>
                    )}
                  </div>

                  {eventDetails.categoryId && (
                    <div className={styles.formGroup}>
                      <label htmlFor="subcategoryId">Event Subcategory</label>
                      <select
                        id="subcategoryId"
                        name="subcategoryId"
                        className={styles.formInput}
                        value={eventDetails.subcategoryId}
                        onChange={handleEventDetailsChange}
                        disabled={isLoadingSubcategories}
                      >
                        <option value="">Select a subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option
                            key={subcategory.subcategory_id}
                            value={subcategory.subcategory_id}
                          >
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                      {isLoadingSubcategories && (
                        <small className={styles.helperText}>
                          Loading subcategories...
                        </small>
                      )}
                      {!isLoadingSubcategories &&
                        subcategories.length === 0 && (
                          <small className={styles.helperText}>
                            No subcategories available for this category
                          </small>
                        )}
                    </div>
                  )}

                  {/* Always show date fields for both hourly and daily pricing */}
                  <div className={styles.formGroupRow}>
                    <div className={styles.formGroupHalf}>
                      <label htmlFor="startDate">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        className={styles.formInput}
                        value={eventDetails.startDate}
                        onChange={handleEventDetailsChange}
                      />
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        className={styles.formInput}
                        value={eventDetails.endDate}
                        onChange={handleEventDetailsChange}
                        disabled={
                          eventDetails.selectedPricingOption === "hourly"
                        }
                        title={
                          eventDetails.selectedPricingOption === "hourly"
                            ? "End date is same as start date for hourly pricing"
                            : ""
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.formGroupRow}>
                    <div className={styles.formGroupHalf}>
                      <label htmlFor="startTime">Start Time</label>
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        className={styles.formInput}
                        value={eventDetails.startTime}
                        onChange={handleEventDetailsChange}
                      />
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label htmlFor="endTime">End Time</label>
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        className={styles.formInput}
                        value={eventDetails.endTime}
                        onChange={handleEventDetailsChange}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="attendees">
                      Expected Number of Attendees
                    </label>
                    <input
                      type="number"
                      id="attendees"
                      name="attendees"
                      placeholder="Enter number of attendees"
                      max={selectedVenue.capacity}
                      className={styles.formInput}
                      value={eventDetails.attendees}
                      onChange={handleEventDetailsChange}
                    />
                    <small className={styles.helperText}>
                      Max: {selectedVenue.capacity} people
                    </small>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    marginTop: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 20px 0",
                      color: "#333",
                    }}
                  >
                    Pricing Options
                  </h3>

                  {/* Display pricing options based on venue pricing_type */}
                  {selectedVenue.pricing_type === "hourly" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "4px",
                      }}
                    >
                      <input
                        type="radio"
                        id="hourlyRate"
                        name="pricingOption"
                        defaultChecked
                        onChange={() => handlePricingOptionChange("hourly")}
                        style={{ marginRight: "10px" }}
                      />
                      <label
                        htmlFor="hourlyRate"
                        style={{ cursor: "pointer", color: "#333" }}
                      >
                        Hourly Rate:{" "}
                        <strong>{selectedVenue.cost_hourly} EGP/hour</strong>
                      </label>
                    </div>
                  )}

                  {selectedVenue.pricing_type === "daily" && (
                    <div className={styles.pricingOption}>
                      <input
                        type="radio"
                        id="dailyRate"
                        name="pricingOption"
                        defaultChecked
                        onChange={() => handlePricingOptionChange("daily")}
                      />
                      <label htmlFor="dailyRate">
                        Daily Rate:{" "}
                        <strong>{selectedVenue.cost_daily} EGP/day</strong>
                      </label>
                    </div>
                  )}

                  {selectedVenue.pricing_type === "both" && (
                    <>
                      <div className={styles.pricingOption}>
                        <input
                          type="radio"
                          id="hourlyRate"
                          name="pricingOption"
                          defaultChecked
                          onChange={() => handlePricingOptionChange("hourly")}
                        />
                        <label htmlFor="hourlyRate">
                          Hourly Rate:{" "}
                          <strong>{selectedVenue.cost_hourly} EGP/hour</strong>
                        </label>
                      </div>

                      <div className={styles.pricingOption}>
                        <input
                          type="radio"
                          id="dailyRate"
                          name="pricingOption"
                          onChange={() => handlePricingOptionChange("daily")}
                        />
                        <label htmlFor="dailyRate">
                          Daily Rate:{" "}
                          <strong>{selectedVenue.cost_daily} EGP/day</strong>
                        </label>
                      </div>
                    </>
                  )}

                  <div
                    style={{
                      backgroundColor: "rgba(162, 98, 162, 0.1)",
                      padding: "15px",
                      borderRadius: "5px",
                      marginTop: "20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid rgba(162, 98, 162, 0.2)",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: "18px",
                        color: "#333",
                      }}
                    >
                      Estimated Cost:
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "24px",
                        color: "var(--purple-dark)",
                      }}
                    >
                      {calculatedPrice} EGP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "25px",
                marginBottom: "25px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginRight: "20px",
              }}
            >
              <button
                style={{
                  borderColor: "#ddd",
                  color: "#666",
                  padding: "8px 16px",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => closeReserveVenueModal()}
              >
                Cancel
              </button>
              <button
                style={{
                  backgroundColor: "var(--purple-light)",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                onClick={handleProceedToPayment}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--purple-mid)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--purple-light)")
                }
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venue Owner Modal */}
      {selectedOwner && (
        <VenueOwnerModal
          ownerId={selectedOwner}
          onClose={() => setSelectedOwner(null)}
        />
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className={styles.modalOverlay}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                color: "white",
                fontSize: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontSize: "24px",
                marginBottom: "20px",
                color: "#333",
                fontWeight: "600",
              }}
            >
              Payment Successful!
            </h2>
            <p
              style={{
                fontSize: "18px",
                marginBottom: "30px",
                color: "#555",
                lineHeight: "1.5",
              }}
            >
              Your venue reservation has been confirmed.
            </p>
          </div>
        </div>
      )}

      {/* Payment Error Modal */}
      {showPaymentError && (
        <div className={styles.modalOverlay}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: "#F44336",
                color: "white",
                fontSize: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
              }}
            >
              ✕
            </div>
            <h2
              style={{
                fontSize: "24px",
                marginBottom: "20px",
                color: "#333",
                fontWeight: "600",
              }}
            >
              Payment Cancelled
            </h2>
            <p
              style={{
                fontSize: "18px",
                marginBottom: "30px",
                color: "#555",
                lineHeight: "1.5",
              }}
            >
              Your payment was cancelled. No charges were made.
            </p>
            <button
              style={{
                padding: "12px 40px",
                backgroundColor: "var(--purple-light)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                margin: "0 auto",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--purple-mid)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--purple-light)")
              }
              onClick={() => setShowPaymentError(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.confirmationModal || styles.successModal}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                marginBottom: "20px",
                color: "#333",
                fontWeight: "600",
              }}
            >
              Confirm Reservation
            </h2>
            <p
              style={{
                fontSize: "18px",
                marginBottom: "30px",
                color: "#555",
                lineHeight: "1.5",
              }}
            >
              Confirm reservation of <strong>{selectedVenue.name}</strong> for{" "}
              <strong>{calculatedPrice.toFixed(2)} EGP</strong>?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <button
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#f0f0f0",
                  color: "#555",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e0e0e0")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "12px 40px",
                  backgroundColor: "var(--purple-light)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--purple-mid)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--purple-light)")
                }
                onClick={handleConfirmedPayment}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizerDashboard;
