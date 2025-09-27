import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logoutUser } from "../../utils/authService";
import { getAllEvents, getCategories } from "../../utils/eventService";
import DashboardHeader from "../../components/DashboardHeader";
import EventDetailsModal from "../../components/modals/EventDetailsModal";
import { QRCodeSVG } from "qrcode.react";
import styles from "./AttendeeDashboard.module.css";

// Initial dashboard data structure
const initialDashboardData = {
  events: {
    upcoming: 0,
    total: 0,
  },
  tickets: {
    total: 0,
  },
  notifications: [
    {
      id: 1,
      message: "Welcome to your Attendee Dashboard!",
      time: "just now",
      isNew: true,
    },
  ],
};

// Default empty arrays for categories and subcategories
const defaultCategories = [];

function AttendeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // No active filter needed
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventsFound, setEventsFound] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [eventCategories, setEventCategories] = useState(defaultCategories);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [reservationId, setReservationId] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [showTicketsSection, setShowTicketsSection] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newNotificationsCount, setNewNotificationsCount] = useState(
    dashboardData.notifications.filter((n) => n.isNew).length
  );

  // Check URL parameters for payment status
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const payment = searchParams.get("payment");
    const reservation = searchParams.get("reservation");

    if (payment && reservation) {
      setPaymentStatus(payment);
      setReservationId(reservation);
      setShowPaymentModal(true);

      // Update reservation payment status in the database
      // Use 'confirmed' instead of 'successful' to match the database enum
      updateReservationStatus(
        reservation,
        payment === "success" ? "confirmed" : "cancelled"
      );

      // Remove query parameters from URL without refreshing
      navigate("/dashboards/attendee", { replace: true });
    }
  }, [location.search, navigate]);

  // Function to update reservation status
  const updateReservationStatus = async (reservationId, status) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        `https://connviabackend-production.up.railway.app/api/attendee/reservations/${reservationId}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentStatus: status,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || "Failed to update reservation status");
      }
    } catch (error) {
      // Enhanced error logging
      console.error("Error updating reservation status:", error);
      console.error("Update reservation error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        reservationId,
        status,
      });

      toast.error("Failed to update reservation status");
    }
  };

  // Fetch user reservations
  const fetchUserReservations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        "https://connviabackend-production.up.railway.app/api/attendee/reservations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUserReservations(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch reservations");
      }
    } catch (error) {
      // Enhanced error logging
      console.error("Error fetching reservations:", error);
      console.error("Fetch reservations error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
      });

      toast.error("Failed to fetch reservations");
    }
  };

  // Fetch user tickets
  const fetchUserTickets = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        "https://connviabackend-production.up.railway.app/api/attendee/tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUserTickets(data.data || []);

        // Update dashboard data with ticket count
        setDashboardData((prev) => ({
          ...prev,
          tickets: {
            total: data.count || 0,
          },
        }));
      } else {
        toast.error(data.message || "Failed to fetch tickets");
      }
    } catch (error) {
      // Enhanced error logging
      console.error("Error fetching tickets:", error);
      console.error("Fetch tickets error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
      });

      toast.error("Failed to fetch tickets");
    }
  };

  // Fetch events and categories from the API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch events
        const eventsResponse = await getAllEvents();

        if (eventsResponse.success && eventsResponse.data) {
          // Set all events
          setAllEvents(eventsResponse.data.events || []);
          setFilteredEvents(eventsResponse.data.events || []);

          // Update dashboard data
          setDashboardData((prev) => ({
            ...prev,
            events: {
              upcoming: eventsResponse.data.events.length,
              total: eventsResponse.data.events.length,
            },
          }));

          setEventsFound(eventsResponse.data.events.length);
        } else {
          toast.error(eventsResponse.error || "Failed to fetch events");
        }

        // Fetch categories
        const categoriesResponse = await getCategories();

        if (categoriesResponse.success && categoriesResponse.data) {
          setEventCategories(categoriesResponse.data.categories || []);
        } else {
          toast.error(categoriesResponse.error || "Failed to fetch categories");
        }

        // Fetch user reservations
        await fetchUserReservations();

        // Fetch user tickets
        await fetchUserTickets();
      } catch (error) {
        // Enhanced error logging
        console.error("Error fetching data:", error);
        console.error("Fetch data error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
          code: error.code,
        });

        toast.error("Error loading data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter events based on search query, active category, and active subcategory
  useEffect(() => {
    if (!allEvents.length) return;

    let filtered = [...allEvents];

    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          (event.venue && event.venue.toLowerCase().includes(query))
      );
    }

    // Apply category filter if active category exists
    if (activeCategory) {
      const selectedCategory = eventCategories.find(
        (cat) => cat.id === activeCategory
      );
      if (selectedCategory) {
        filtered = filtered.filter((event) => {
          return event.categoryId === activeCategory;
        });
      }
    }

    // Apply subcategory filter if active subcategory exists
    if (activeSubcategory) {
      filtered = filtered.filter((event) => {
        return event.subcategoryId === activeSubcategory;
      });
    }

    setFilteredEvents(filtered);
    setEventsFound(filtered.length);
  }, [
    allEvents,
    searchQuery,
    activeCategory,
    activeSubcategory,
    eventCategories,
  ]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // No filter handling needed

  const handleCategoryClick = (categoryId) => {
    // If clicking the same category, toggle it off
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setShowSubcategories(false);
      setActiveSubcategory(null);
      setSubcategories([]);
    } else {
      // Set the new active category
      setActiveCategory(categoryId);

      // Find the category and get its subcategories
      const category = eventCategories.find((cat) => cat.id === categoryId);
      if (
        category &&
        category.subcategories &&
        category.subcategories.length > 0
      ) {
        setSubcategories(category.subcategories);
        setShowSubcategories(true);

        // Check if there are any events with this category
        const hasEvents = allEvents.some(
          (event) => event.categoryId === categoryId
        );
        if (!hasEvents) {
          toast.info(`No events found in the "${category.name}" category.`);
        }
      } else {
        setShowSubcategories(false);
        setSubcategories([]);
      }

      // Reset subcategory selection
      setActiveSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategoryId) => {
    setActiveSubcategory(
      activeSubcategory === subcategoryId ? null : subcategoryId
    );
  };

  const toggleFavorite = (eventId) => {
    // Update the filtered events and all events with the new favorite status
    const updatedEvents = filteredEvents.map((event) =>
      event.id === eventId ? { ...event, isFavorite: !event.isFavorite } : event
    );
    setFilteredEvents(updatedEvents);

    // Also update the allEvents array to maintain consistency
    const updatedAllEvents = allEvents.map((event) =>
      event.id === eventId ? { ...event, isFavorite: !event.isFavorite } : event
    );
    setAllEvents(updatedAllEvents);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStatus(null);
    setReservationId(null);
  };

  const handleShowQRCode = (ticket) => {
    setSelectedTicket(ticket);
    setShowQRCodeModal(true);
  };

  const closeQRCodeModal = () => {
    setShowQRCodeModal(false);
    setSelectedTicket(null);
  };

  return (
    <div className={styles.dashboardContainer}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      {/* Use the DashboardHeader component with transparent background */}
      <DashboardHeader
        handleLogout={handleLogout}
        toggleNotifications={toggleNotifications}
        showNotifications={showNotifications}
        newNotificationsCount={newNotificationsCount}
        notifications={dashboardData.notifications || []}
      />

      {/* Main Dashboard Content */}
      <main className={styles.mainContent}>
        <div className={styles.dashboardHeader}></div>

        {/* Dashboard Cards */}
        <div className={styles.cardsGrid}>
          {/* My Events Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>E</span>
                My Events
              </h2>
              <div className={styles.cardValue}>
                {(() => {
                  // Create a Set to track unique event IDs
                  const uniqueEventIds = new Set();

                  // Filter reservations to get only confirmed and upcoming ones
                  const upcomingReservations = userReservations.filter(
                    (res) => {
                      // Only count confirmed reservations
                      if (res.payment_status !== "confirmed") return false;

                      // Check if the reservation has a valid event date and it's in the future
                      if (!res.event_date) return false;

                      const eventDate = new Date(res.event_date);
                      const today = new Date();
                      return eventDate >= today;
                    }
                  );

                  // Add each unique event ID to the Set
                  upcomingReservations.forEach((res) => {
                    uniqueEventIds.add(res.event_ID);
                  });

                  // Return the count of unique events
                  return uniqueEventIds.size;
                })()}
              </div>
              <div className={styles.cardValueContainer}>
                <span>Upcoming</span>
              </div>
            </div>
          </div>

          {/* Tickets Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardIconInline}>T</span>
                  My Tickets & QR Codes
                </h2>
                <button
                  className={styles.viewAllButton}
                  onClick={() => setShowTicketsSection(!showTicketsSection)}
                >
                  {showTicketsSection ? "Hide Tickets" : "View All"}
                </button>
              </div>
              <div className={styles.cardValue}>
                {dashboardData.tickets.total}
              </div>
              <div className={styles.cardValueContainer}>
                <span>Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Section - Only shown when View All is clicked */}
        {showTicketsSection && (
          <div className={styles.ticketsContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Tickets</h2>
            </div>

            {userTickets.length > 0 ? (
              <div className={styles.ticketsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Event</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Created</th>
                      <th>QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTickets.map((ticket) => (
                      <tr key={ticket.ticket_ID}>
                        <td>#{ticket.ticket_ID}</td>
                        <td>{ticket.event_name}</td>
                        <td>{ticket.venue_name || "N/A"}</td>
                        <td>
                          {new Date(ticket.event_date).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className={styles.qrButton}
                            onClick={() => handleShowQRCode(ticket)}
                          >
                            View QR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noTicketsMessage}>
                <p>
                  You don't have any tickets yet. Purchase tickets for an event
                  to see them here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Events Section with Filters */}
        <div className={styles.eventsContainer}>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Categories Section */}
          <div className={styles.categoriesSection}>
            {/* Main Categories */}
            <div className={styles.categoriesScrollContainer}>
              <div className={styles.categoriesRow}>
                <button
                  className={`${styles.categoryPill} ${
                    activeCategory === null ? styles.categoryPillActive : ""
                  }`}
                  onClick={() => handleCategoryClick(null)}
                >
                  All
                </button>

                {eventCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`${styles.categoryPill} ${
                      activeCategory === category.id
                        ? styles.categoryPillActive
                        : ""
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories Section - Only shown when a category is selected */}
            {showSubcategories && subcategories.length > 0 && (
              <div className={styles.subcategoriesContainer}>
                <div className={styles.subcategoriesRow}>
                  {subcategories.map((subcat) => (
                    <button
                      key={subcat.id}
                      className={`${styles.subcategoryPill} ${
                        activeSubcategory === subcat.id
                          ? styles.subcategoryPillActive
                          : ""
                      }`}
                      onClick={() => handleSubcategoryClick(subcat.id)}
                    >
                      {subcat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.eventsFilterBar}>
            <div className={styles.eventsFoundText}>
              {eventsFound} events found
            </div>

            <div className={styles.advancedFiltersContainer}>
              <button className={styles.advancedFiltersButton}>
                Advanced Filters
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 9L12 16L5 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Events Grid */}
          <div className={styles.eventsGrid}>
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading events...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={styles.eventCard}
                  onClick={() => handleEventClick(event)}
                >
                  <div className={styles.eventImageContainer}>
                    <img
                      src={event.image}
                      alt={event.title}
                      className={styles.eventImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x160?text=Event+Image";
                      }}
                    />
                    <button
                      className={`${styles.favoriteButton} ${
                        event.isFavorite ? styles.favoriteActive : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(event.id);
                      }}
                      aria-label={
                        event.isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={event.isFavorite ? "currentColor" : "none"}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div className={styles.eventCategoryBadge}>
                      {event.category}
                    </div>
                  </div>

                  <div className={styles.eventInfo}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>

                    <div className={styles.eventMetaInfo}>
                      <div className={styles.eventDateRow}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 2V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 2V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3 10H21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{event.dateRange}</span>
                      </div>

                      <div className={styles.eventLocationRow}>
                        <span
                          role="img"
                          aria-label="location"
                          style={{ marginRight: "0.25rem" }}
                        >
                          📍
                        </span>
                        <span>{event.venue}</span>
                      </div>

                      <div className={styles.eventPriceRow}>
                        <div className={styles.priceContainer}>
                          <span>
                            {event.price === "Free"
                              ? "Free"
                              : `${event.price} EGP`}
                          </span>
                        </div>
                        <button
                          className={styles.addToCartButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Added ${event.title} to cart`);
                          }}
                          aria-label="Add to cart"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 20C9 21.1 8.1 22 7 22C5.9 22 5 21.1 5 20C5 18.9 5.9 18 7 18C8.1 18 9 18.9 9 20Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M20 20C20 21.1 19.1 22 18 22C16.9 22 16 21.1 16 20C16 18.9 16.9 18 18 18C19.1 18 20 18.9 20 20Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3 3H5.5L7.5 14H18.5L21 6H17M7.5 14C6.2 14 5.1 15.1 5.1 16.4C5.1 16.4 5.1 16.5 5.1 16.5H19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noEventsMessage}>
                <i className="fas fa-calendar-times"></i>
                <p>No events found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}

      {/* QR Code Modal */}
      {showQRCodeModal && selectedTicket && (
        <div className={styles.modalOverlay}>
          <div className={styles.qrCodeModal}>
            <div className={styles.qrCodeModalHeader}>
              <h2>Ticket QR Code</h2>
              <button
                className={styles.closeModalButton}
                onClick={closeQRCodeModal}
              >
                &times;
              </button>
            </div>
            <div className={styles.qrCodeModalContent}>
              <div className={styles.qrCodeContainer}>
                <QRCodeSVG
                  value={selectedTicket.qr_code}
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className={styles.ticketDetails}>
                <h3>Ticket Details</h3>
                <p>
                  <strong>Ticket ID:</strong> #{selectedTicket.ticket_ID}
                </p>
                <p>
                  <strong>Event:</strong> {selectedTicket.event_name}
                </p>
                <p>
                  <strong>Venue:</strong> {selectedTicket.venue_name || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedTicket.event_date).toLocaleDateString()}
                </p>
                <p className={styles.ticketNote}>
                  Show this QR code at the event entrance for admission.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.paymentStatusModal}>
            <button className={styles.closeButton} onClick={closePaymentModal}>
              &times;
            </button>

            {paymentStatus === "success" ? (
              <div className={styles.successContent}>
                <div className={styles.successIcon}>✓</div>
                <h2>Payment Successful!</h2>
                <p>Your ticket purchase has been confirmed.</p>
                <p>You can view your tickets in your account.</p>
                <button
                  className={styles.viewTicketsButton}
                  onClick={() => {
                    closePaymentModal();
                    // Add logic to navigate to tickets section
                    toast.info("Feature coming soon: View your tickets");
                  }}
                >
                  View My Tickets
                </button>
              </div>
            ) : (
              <div className={styles.failureContent}>
                <div className={styles.failureIcon}>✗</div>
                <h2>Payment Cancelled</h2>
                <p>Your payment was not completed.</p>
                <p>No charges have been made to your account.</p>
                <button
                  className={styles.tryAgainButton}
                  onClick={closePaymentModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendeeDashboard;
