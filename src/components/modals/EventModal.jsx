import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { getOrganizerReservations } from "../../utils/reservationService";
import styles from "./Modal.module.css";
import "../../pages/dashboards/EventModalFix.css"; // Import the custom styles for the modal fixes

const EventModal = ({ onClose, onCreateEvent }) => {
  const [paidReservations, setPaidReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    title: "",
    description: "",
    ticketPrice: "",
    capacity: "",
    eventDate: "",
    eventEndDate: "", // Added end date field
    eventTime: "",
    eventEndTime: "", // Added end time field
    reservation_ID: null,
    image: "", // Added image field for event poster
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [step, setStep] = useState(1); // Step 1: Select reservation or request one, Step 2: Enter details

  const fetchPaidReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching organizer reservations...");
      const response = await getOrganizerReservations();
      console.log("Reservation response:", response);

      if (response.success && response.data) {
        // Get all reservations
        if (response.data.reservations) {
          // Filter to only include paid reservations
          const paid = response.data.reservations.filter(
            (res) => res.payment_status === "paid"
          );
          console.log("Paid reservations found:", paid.length);
          setPaidReservations(paid);

          if (paid.length === 0 && response.data.message) {
            setError(response.data.message);
          }
        } else {
          console.error("No reservations array in response data");
          setPaidReservations([]);
        }
      } else {
        console.error("Failed to fetch reservations:", response.error);
        setError(response.error || "Failed to fetch your reservations");
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("An unexpected error occurred while fetching reservations");
    } finally {
      setLoading(false);
    }
  };

  // Call fetch on component mount
  useEffect(() => {
    fetchPaidReservations();
  }, []);

  const handleReservationSelect = (reservation) => {
    setSelectedReservation(reservation);
    // Pre-fill event details based on reservation
    setEventDetails({
      ...eventDetails,
      eventDate: reservation.reservation_date,
      eventTime: reservation.start_time,
      capacity: reservation.attendees_count,
      reservation_ID: reservation.reservation_ID,
    });
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Image size must be less than 2MB");
          return;
        }

        // Check file type
        if (!file.type.match("image.*")) {
          toast.error("Please select an image file");
          return;
        }

        // For preview, convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;

          // Store preview for display purposes
          setImagePreview(base64String);

          // Store the file object directly, just like in venue implementation
          setEventDetails({
            ...eventDetails,
            imageFile: file,
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setEventDetails({
        ...eventDetails,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedReservation) {
      toast.error("Please select a reservation first");
      return;
    }

    // Create a FormData object for the event, just like in venue implementation
    const formData = new FormData();

    // Add all required fields to the FormData with new field names
    formData.append("name", eventDetails.title);
    formData.append("description", eventDetails.description);

    // Format the dates to YYYY-MM-DD format for MySQL
    const startDateObj = new Date(eventDetails.eventDate);
    const formattedStartDate = startDateObj.toISOString().split("T")[0]; // Gets YYYY-MM-DD
    formData.append("start_date", formattedStartDate);

    // Add end_date if available, otherwise use start_date
    if (eventDetails.eventEndDate) {
      const endDateObj = new Date(eventDetails.eventEndDate);
      const formattedEndDate = endDateObj.toISOString().split("T")[0];
      formData.append("end_date", formattedEndDate);
    } else {
      formData.append("end_date", formattedStartDate); // Default to same as start date
    }

    // Add time fields
    formData.append("start_time", eventDetails.eventTime);
    formData.append(
      "end_time",
      eventDetails.eventEndTime || eventDetails.eventTime
    ); // Default to same as start time

    formData.append("price", eventDetails.ticketPrice);
    formData.append("duration", eventDetails.eventTime); // Keep duration for backward compatibility
    formData.append("reservation_ID", selectedReservation.reservation_ID);

    // Add the image file if it exists, just like in venue implementation
    if (eventDetails.imageFile) {
      formData.append("image", eventDetails.imageFile);
    }

    // Log the form data for debugging
    console.log(
      "Form data created with image:",
      eventDetails.imageFile ? "Yes" : "No"
    );

    // Pass the FormData to the parent component
    onCreateEvent(formData);
    onClose();
  };

  const handleBackToReservations = () => {
    setStep(1);
    setSelectedReservation(null);
  };

  const handleRetry = () => {
    fetchPaidReservations();
  };

  const goToReserveVenue = () => {
    // Close the current modal
    onClose();
    // Show toast to guide the user
    toast.info(
      "Please use the Reserve Venue button to create a reservation first"
    );
  };

  // Function to properly format the venue image URL
  const getVenueImageUrl = (reservation) => {
    if (!reservation || !reservation.images) {
      return "https://via.placeholder.com/300x200";
    }

    // Handle array or string
    const imageUrl = Array.isArray(reservation.images)
      ? reservation.images[0]
      : reservation.images;

    // Extract filename (ignores any localhost or full URL)
    const filename = imageUrl.split("/").pop().split(",")[0].trim();

    return `https://connviabackend-production.up.railway.app/uploads/venues/${filename}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Glassy sticky header with Back to Reservations link and close button */}
        <div className="modal-header">
          {step === 2 ? (
            <a className="back-link" onClick={handleBackToReservations}>
              &larr; Back to Reservations
            </a>
          ) : (
            <h2>Create Event</h2>
          )}
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {step === 2 && (
            <h2 className="event-details-title">{"Event Details"}</h2>
          )}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading your paid reservations...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h3>Couldn&apos;t load your reservations</h3>
              <p>{error}</p>
              <div className={styles.errorActions}>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Retry
                </button>
                <button
                  className={styles.reserveNowButton}
                  onClick={goToReserveVenue}
                >
                  Reserve a Venue
                </button>
              </div>
              <div className={styles.errorHint}>
                <p>
                  If you&apos;ve already paid for a venue reservation and are
                  seeing this error:
                </p>
                <ol>
                  <li>
                    Make sure you&apos;re logged in with the correct account
                  </li>
                  <li>Verify that your payment was processed successfully</li>
                  <li>Try refreshing the page before retrying</li>
                </ol>
              </div>
            </div>
          ) : step === 1 ? (
            <div className={styles.reservationsList}>
              <h3 className={styles.sectionTitle}>Select a Reserved Venue</h3>

              {paidReservations.length === 0 ? (
                <div className={styles.noReservations}>
                  <p>You don&apos;t have any paid venue reservations yet.</p>
                  <p>
                    Please reserve and pay for a venue before creating an event.
                  </p>
                  <button
                    className={styles.reserveNowButton}
                    onClick={goToReserveVenue}
                  >
                    Reserve a Venue Now
                  </button>
                </div>
              ) : (
                <div className={styles.venueGrid}>
                  {paidReservations.map((reservation) => (
                    <div
                      key={reservation.reservation_ID}
                      className={styles.venueCard}
                      onClick={() => handleReservationSelect(reservation)}
                    >
                      <div className={styles.venueImageContainer}>
                        <img
                          src={getVenueImageUrl(reservation)}
                          alt={reservation.venue_name || "Venue"}
                          className={styles.venueImage}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x200";
                          }}
                        />
                      </div>
                      <div className={styles.venueCardDetails}>
                        <h4 className={styles.venueCardTitle}>
                          {reservation.venue_name ||
                            `Venue #${reservation.venue_ID}`}
                        </h4>
                        <p className={styles.venueCardCategory}>
                          {reservation.category_name || "General"}
                        </p>
                        <p>
                          Date:{" "}
                          {new Date(
                            reservation.reservation_date
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          Time: {reservation.start_time} -{" "}
                          {reservation.end_time}
                        </p>
                        <div className={styles.venueCardFooter}>
                          <span className={styles.venueCapacity}>
                            Capacity: {reservation.attendees_count}
                          </span>
                          <span className={styles.reservationId}>
                            ID: {reservation.reservation_ID}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.eventForm}>
              <div className={styles.selectedVenueInfo}>
                <h3>
                  {selectedReservation.venue_name ||
                    `Venue #${selectedReservation.venue_ID}`}
                </h3>
                <div
                  className={styles.venueImageContainer}
                  style={{ height: "200px", marginBottom: "15px" }}
                >
                  <img
                    src={getVenueImageUrl(selectedReservation)}
                    alt={selectedReservation.venue_name || "Venue"}
                    className={styles.venueImage}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200";
                    }}
                  />
                </div>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    selectedReservation.reservation_date
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {selectedReservation.start_time} -{" "}
                  {selectedReservation.end_time}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {selectedReservation.category_name || "General"}
                </p>
                <p>
                  <strong>Capacity:</strong>{" "}
                  {selectedReservation.attendees_count} people
                </p>
                <p className={styles.reservationId}>
                  Reservation ID: {selectedReservation.reservation_ID}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Event Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className={styles.formInput}
                    value={eventDetails.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Event Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className={styles.formTextarea}
                    value={eventDetails.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                  />
                </div>

                <div className={styles.formGroupRow}>
                  <div className={styles.formGroupHalf}>
                    <label htmlFor="ticketPrice">Ticket Price (EGP)</label>
                    <input
                      type="number"
                      id="ticketPrice"
                      name="ticketPrice"
                      className={styles.formInput}
                      value={eventDetails.ticketPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className={styles.formGroupHalf}>
                    <label htmlFor="capacity">Capacity</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      className={styles.formInput}
                      value={eventDetails.capacity}
                      onChange={handleInputChange}
                      max={selectedReservation.attendees_count}
                      required
                    />
                  </div>
                </div>

                {/* Date fields - Start and End Date */}
                <div className={styles.formGroupRow}>
                  <div className={styles.formGroupHalf}>
                    <label htmlFor="eventDate">Start Date</label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      className={styles.formInput}
                      value={eventDetails.eventDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroupHalf}>
                    <label htmlFor="eventEndDate">End Date</label>
                    <input
                      type="date"
                      id="eventEndDate"
                      name="eventEndDate"
                      className={styles.formInput}
                      value={eventDetails.eventEndDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Time fields - Start and End Time */}
                <div className={styles.formGroupRow}>
                  <div className={styles.formGroupHalf}>
                    <label htmlFor="eventTime">Start Time</label>
                    <input
                      type="time"
                      id="eventTime"
                      name="eventTime"
                      className={styles.formInput}
                      value={eventDetails.eventTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroupHalf}>
                    <label htmlFor="eventEndTime">End Time</label>
                    <input
                      type="time"
                      id="eventEndTime"
                      name="eventEndTime"
                      className={styles.formInput}
                      value={eventDetails.eventEndTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="eventImage">Event Poster Image</label>
                  <div className={styles.imageUploadContainer}>
                    {imagePreview ? (
                      <div className={styles.imagePreviewContainer}>
                        <img
                          src={imagePreview}
                          alt="Event poster preview"
                          className={styles.imagePreview}
                        />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => {
                            setImagePreview(null);
                            setEventDetails({
                              ...eventDetails,
                              image: "",
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className={styles.imageUploadBox}>
                        <input
                          type="file"
                          id="eventImage"
                          name="image"
                          accept="image/*"
                          onChange={handleInputChange}
                          className={styles.imageInput}
                        />
                        <div className={styles.uploadPlaceholder}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M17 8L12 3L7 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 3V15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p>Click to upload or drag and drop</p>
                          <span>SVG, PNG, JPG or GIF (max. 2MB)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formFooter}>
                  <button type="submit" className={styles.createEventButton}>
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EventModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreateEvent: PropTypes.func.isRequired,
};

export default EventModal;
