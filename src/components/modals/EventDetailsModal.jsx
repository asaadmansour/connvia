import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./EventDetailsModal.module.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { getToken } from "../../utils/authService";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const EventDetailsModal = ({ event, isOpen, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(event.isFavorite || false);
  const [coordinates, setCoordinates] = useState({
    lat: 30.0444,
    lng: 31.2357,
  }); // Default to Cairo
  const [locationName, setLocationName] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState("Free");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Parse coordinates from event data if available
    try {
      if (event.coordinates) {
        const coords = JSON.parse(event.coordinates);
        setCoordinates(coords);
      }
    } catch (error) {
      /* log removed */
    }

    // Fetch location name from coordinates
    const fetchLocationName = async () => {
      setIsLoadingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`
        );
        const data = await response.json();
        setLocationName(data.display_name || "Unknown location");
      } catch (error) {
        /* log removed */
        setLocationName("Unknown location");
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocationName();
  }, [event.coordinates, coordinates.lat, coordinates.lng]);

  // Update total price when ticket quantity changes
  useEffect(() => {
    if (event.price === "Free") {
      setTotalPrice("Free");
    } else {
      const basePrice = parseFloat(event.price);
      const total = basePrice * ticketQuantity;
      setTotalPrice(`${total.toFixed(2)} EGP`);
    }
  }, [ticketQuantity, event.price]);

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

        setLocationName(placeName || response.data.display_name);
      }
    } catch (error) {
      /* log removed */
    } finally {
      setIsLoadingLocation(false);
    }
  };

  if (!isOpen) return null;

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Handle payment through Stripe
  const handleProceedToPayment = async () => {
    try {
      setIsProcessingPayment(true);

      if (ticketQuantity < 1 || ticketQuantity > 10) {
        toast.error("Please select between 1 and 10 tickets");
        setIsProcessingPayment(false);
        return;
      }

      // Calculate total amount
      const priceValue = event.price === "Free" ? 0 : parseFloat(event.price);
      const totalAmount = priceValue * ticketQuantity;

      // Get the token using the authService function
      const token = getToken();
      if (!token) {
        toast.error("You must be logged in to purchase tickets");
        setIsProcessingPayment(false);
        return;
      }

      /* log removed */

      // First create an attendee reservation
      /* log removed */

      const reservationResponse = await fetch(
        "https://connviabackend-production.up.railway.app/api/attendee/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event.id,
            quantity: ticketQuantity,
            totalPrice: totalAmount,
          }),
        }
      );

      const reservationData = await reservationResponse.json();

      if (!reservationData.success) {
        throw new Error(
          reservationData.message || "Failed to create reservation"
        );
      }

      const reservationId = reservationData.data.reservationId;

      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      // Get the checkout URL from your backend
      /* log removed */

      // Get a fresh token to ensure it's valid
      const freshToken = getToken();
      if (!freshToken) {
        throw new Error("Authentication token not found");
      }

      /* log removed */

      const checkoutResponse = await fetch(
        "https://connviabackend-production.up.railway.app/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`, // Add the auth token
          },
          body: JSON.stringify({
            attendeeReservationId: reservationId,
            amount: totalAmount,
            venueName: event.title,
            description: `${ticketQuantity} ticket(s) for ${event.title}`,
            quantity: ticketQuantity,
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
      onClose();

      // Redirect to Stripe Checkout
      window.location.href = checkoutData.url;
    } catch (error) {
      // Enhanced error logging
      /* log removed */
      /* log removed */

      toast.error(error.message || "An error occurred. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  // Handle ticket quantity changes
  const decreaseQuantity = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity(ticketQuantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (ticketQuantity < 10) {
      setTicketQuantity(ticketQuantity + 1);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Sticky Modal Actions - positioned at the top */}
        <div className={styles.stickyHeader}>
          <div className={styles.modalActions}>
            <button className={styles.closeButton} onClick={onClose}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={`${styles.favoriteButton} ${
                isFavorite ? styles.favoriteActive : ""
              }`}
              onClick={toggleFavorite}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
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
          </div>
        </div>

        <div className={styles.eventContainer}>
          {/* Left Column */}
          <div className={styles.eventMainContent}>
            {/* Event Title */}
            <h1 className={styles.eventTitle}>{event.title}</h1>

            {/* Event Image */}
            <div className={styles.eventImageContainer}>
              <img
                src={
                  event.image ||
                  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                }
                alt={event.title}
                className={styles.eventImage}
              />
            </div>

            {/* Event Details Sections */}
            <div className={styles.eventDetailSections}>
              {/* Date and Time Section */}
              <div className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>Date and time</h2>
                <div className={styles.sectionContent}>
                  <div className={styles.eventMetaItem}>
                    <div className={styles.metaIcon}>
                      <svg
                        width="16"
                        height="16"
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
                    </div>
                    <span>
                      {event.dateRange ||
                        `${event.start_date} at ${event.start_time}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>Location</h2>
                <div className={styles.sectionContent}>
                  <div className={styles.eventMetaItem}>
                    <div className={styles.metaIcon}>
                      <span
                        role="img"
                        aria-label="location"
                        style={{ marginRight: "0.25rem" }}
                      >
                        📍
                      </span>
                    </div>
                    <span>
                      {event.venue ||
                        event.location ||
                        locationName ||
                        "Location not available"}
                    </span>
                  </div>
                </div>
                <div className={styles.mapContainer}>
                  <MapContainer
                    key={`${coordinates.lat}-${coordinates.lng}`}
                    center={[coordinates.lat, coordinates.lng]}
                    zoom={13}
                    style={{
                      height: "200px",
                      width: "100%",
                      borderRadius: "8px",
                    }}
                    zoomControl={true}
                    dragging={true}
                    scrollWheelZoom={true}
                    doubleClickZoom={true}
                    attributionControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coordinates.lat, coordinates.lng]}>
                      <Popup>
                        <strong>{event.title}</strong>
                        <br />
                        {locationName || event.location || event.venue}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className={styles.directionsButtonContainer}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 20px",
                      backgroundColor: "#8a4a8a", // Purple mid color
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      textDecoration: "none",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      width: "80%",
                      maxWidth: "300px",
                      transition:
                        "background-color 0.2s ease, transform 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#734078")
                    } // Darker on hover
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#8a4a8a")
                    } // Back to normal
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: "8px" }}
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                        fill="white"
                      />
                    </svg>
                    Get Directions
                  </a>
                </div>
              </div>

              {/* About this event */}
              <div className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>About this event</h2>
                <div className={styles.sectionContent}>
                  <p className={styles.descriptionText}>
                    {event.description ||
                      "Red Bull Culture Clash is a one-of-a-kind music event that brings together the energy, creativity, and skills of four sound system crews, supported by the world's top DJs."}
                  </p>
                </div>
              </div>

              {/* Organizer Section */}
              <div className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>Organized by</h2>
                <div className={styles.organizerInfo}>
                  <h3 className={styles.organizerName}>
                    {event.organizer_name || "Unknown Organizer"}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Selection */}
          <div className={styles.ticketSidebar}>
            <div className={styles.ticketCard}>
              <h3 className={styles.ticketCardTitle}>Select tickets</h3>

              <div className={styles.priceDisplay}>
                <span className={styles.priceValue}>{totalPrice}</span>
              </div>

              <div className={styles.ticketQuantity}>
                <span className={styles.quantityLabel}>Number of tickets</span>
                <div className={styles.quantityControls}>
                  <button
                    className={styles.quantityButton}
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <input
                    id="ticketCount"
                    type="number"
                    className={styles.quantityInput}
                    min="1"
                    max="10"
                    value={ticketQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 10) {
                        setTicketQuantity(value);
                      }
                    }}
                    readOnly
                  />
                  <button
                    className={styles.quantityButton}
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.addToCartButton}>Add to Cart</button>
                <button
                  className={styles.buyTicketButton}
                  onClick={handleProceedToPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EventDetailsModal.propTypes = {
  event: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventDetailsModal;
