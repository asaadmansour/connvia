import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import "./ReserveVenue.css";

const ReserveVenueModal = ({
  venue,
  onClose,
  onReserve,
  categories = [],
  subcategories = [],
  isLoadingCategories = false,
  isLoadingSubcategories = false,
  onCategoryChange,
  calculatedPrice = 0,
}) => {
  const [formattedLocation, setFormattedLocation] = useState(
    "No address available"
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    categoryId: "",
    subcategoryId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    attendees: "",
    selectedPricingOption: venue?.pricing_type === "daily" ? "daily" : "hourly",
  });

  // Set default pricing option based on venue pricing type
  useEffect(() => {
    if (venue) {
      setEventDetails((prev) => ({
        ...prev,
        selectedPricingOption:
          venue.pricing_type === "daily" ? "daily" : "hourly",
      }));

      // Parse location coordinates and fetch address
      if (venue.location) {
        try {
          let coordinates;
          if (typeof venue.location === "string") {
            coordinates = JSON.parse(venue.location);
          } else {
            coordinates = venue.location;
          }

          if (coordinates && coordinates.lat && coordinates.lng) {
            fetchLocationName(coordinates.lat, coordinates.lng);
          }
        } catch (error) {
          /* log removed */
          setFormattedLocation("Location information unavailable");
        }
      }
    }
  }, [venue]);

  // Function to fetch location name from coordinates
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
      }
    } catch (error) {
      /* log removed */
      setFormattedLocation("Location information unavailable");
    } finally {
      setIsLoadingLocation(false);
    }
  };

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
    } else {
      setEventDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePricingOptionChange = (option) => {
    // If switching to hourly, make sure end date equals start date
    if (option === "hourly") {
      setEventDetails((prev) => ({
        ...prev,
        selectedPricingOption: option,
        endDate: prev.startDate, // Set end date equal to start date for hourly option
      }));
    } else {
      // For daily option, keep dates as they are
      setEventDetails((prev) => ({
        ...prev,
        selectedPricingOption: option,
      }));
    }
  };

  const handleProceedToPayment = () => {
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

    // Call the onReserve function with the event details
    onReserve({
      ...eventDetails,
      venueId: venue.venue_ID || venue.id,
    });
  };

  // Function to get image URL
  const getImageUrl = () => {
    if (!venue || !venue.images) {
      return "https://via.placeholder.com/300x200?text=No+Image";
    }

    // Support array or string (comma-separated URLs)
    let imageUrl;
    if (Array.isArray(venue.images)) {
      imageUrl = venue.images[0];
    } else {
      // If it's a string with multiple URLs separated by commas
      imageUrl = venue.images.split(",")[0].trim();
    }

    try {
      // Extract only the filename (remove any http://localhost or full path)
      const filename = imageUrl.split("/").pop().trim();

      return `https://connviabackend-production.up.railway.app/uploads/venues/${filename}`;
    } catch (error) {
      /* log removed */
      return "https://via.placeholder.com/300x200?text=Error";
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content" style={{ maxWidth: "900px", padding: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 20px",
            borderBottom: "1px solid #eaeaea",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "22px" }}>Reserve Venue</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "row" }}>
          {/* Venue Details Section */}
          <div className="venue-details-container" style={{ width: "40%" }}>
            <h3>Venue Details</h3>

            <div className="venue-image-container">
              <img
                src={getImageUrl()}
                alt={venue?.name || "Venue"}
                className="venue-image"
                onError={(e) => {
                  /* log removed */
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
            </div>

            <ul className="venue-details-list">
              <li>
                <span className="label">Name:</span>
                <span className="value">{venue?.name || "N/A"}</span>
              </li>
              <li>
                <span className="label">Location:</span>
                <span className="value">
                  {isLoadingLocation ? (
                    <span>Loading location...</span>
                  ) : (
                    formattedLocation
                  )}
                </span>
              </li>
              <li>
                <span className="label">Capacity:</span>
                <span className="value">{venue?.capacity || 0} people</span>
              </li>
              <li>
                <span className="label">Category:</span>
                <span className="value">{venue?.category || "N/A"}</span>
              </li>
              <li>
                <span className="label">Owner:</span>
                <span className="value">{venue?.ownerName || "N/A"}</span>
              </li>
            </ul>
          </div>

          {/* Event Details Section */}
          <div className="event-details-container" style={{ width: "60%" }}>
            <h3>Event Details</h3>

            <div className="form-group">
              <label htmlFor="categoryId">Event Category</label>
              <select
                id="categoryId"
                name="categoryId"
                className="form-input"
                value={eventDetails.categoryId}
                onChange={(e) => {
                  handleEventDetailsChange(e);
                  if (onCategoryChange) {
                    onCategoryChange(e.target.value);
                  }
                }}
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
                <small className="helper-text">Loading categories...</small>
              )}
            </div>

            {eventDetails.categoryId && (
              <div className="form-group">
                <label htmlFor="subcategoryId">Event Subcategory</label>
                <select
                  id="subcategoryId"
                  name="subcategoryId"
                  className="form-input"
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
                  <small className="helper-text">
                    Loading subcategories...
                  </small>
                )}
                {!isLoadingSubcategories && subcategories.length === 0 && (
                  <small className="helper-text">
                    No subcategories available for this category
                  </small>
                )}
              </div>
            )}

            {/* Always show date fields for both hourly and daily pricing */}
            <div className="date-input-container">
              <div className="date-input-field">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-input"
                  value={eventDetails.startDate}
                  onChange={handleEventDetailsChange}
                />
              </div>

              <div className="date-input-field">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-input"
                  value={eventDetails.endDate}
                  onChange={handleEventDetailsChange}
                  disabled={eventDetails.selectedPricingOption === "hourly"}
                  title={
                    eventDetails.selectedPricingOption === "hourly"
                      ? "End date is same as start date for hourly pricing"
                      : ""
                  }
                />
              </div>
            </div>

            <div className="date-input-container">
              <div className="date-input-field">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  className="form-input"
                  value={eventDetails.startTime}
                  onChange={handleEventDetailsChange}
                />
              </div>

              <div className="date-input-field">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  className="form-input"
                  value={eventDetails.endTime}
                  onChange={handleEventDetailsChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="attendees">Expected Number of Attendees</label>
              <input
                type="number"
                id="attendees"
                name="attendees"
                placeholder="Enter number of attendees"
                max={venue?.capacity}
                className="form-input"
                value={eventDetails.attendees}
                onChange={handleEventDetailsChange}
              />
              <small className="helper-text">
                Max: {venue?.capacity || 0} people
              </small>
            </div>

            <div className="pricing-options">
              <h3>Pricing Options</h3>

              {/* Display pricing options based on venue pricing_type */}
              {venue?.pricing_type === "hourly" && (
                <div className="pricing-option">
                  <input
                    type="radio"
                    id="hourlyRate"
                    name="pricingOption"
                    defaultChecked
                    onChange={() => handlePricingOptionChange("hourly")}
                  />
                  <label htmlFor="hourlyRate">
                    Hourly Rate: <strong>{venue?.cost_hourly} EGP/hour</strong>
                  </label>
                </div>
              )}

              {venue?.pricing_type === "daily" && (
                <div className="pricing-option">
                  <input
                    type="radio"
                    id="dailyRate"
                    name="pricingOption"
                    defaultChecked
                    onChange={() => handlePricingOptionChange("daily")}
                  />
                  <label htmlFor="dailyRate">
                    Daily Rate: <strong>{venue?.cost_daily} EGP/day</strong>
                  </label>
                </div>
              )}

              {venue?.pricing_type === "both" && (
                <>
                  <div className="pricing-option">
                    <input
                      type="radio"
                      id="hourlyRate"
                      name="pricingOption"
                      defaultChecked={
                        eventDetails.selectedPricingOption === "hourly"
                      }
                      onChange={() => handlePricingOptionChange("hourly")}
                    />
                    <label htmlFor="hourlyRate">
                      Hourly Rate:{" "}
                      <strong>{venue?.cost_hourly} EGP/hour</strong>
                    </label>
                  </div>

                  <div className="pricing-option">
                    <input
                      type="radio"
                      id="dailyRate"
                      name="pricingOption"
                      defaultChecked={
                        eventDetails.selectedPricingOption === "daily"
                      }
                      onChange={() => handlePricingOptionChange("daily")}
                    />
                    <label htmlFor="dailyRate">
                      Daily Rate: <strong>{venue?.cost_daily} EGP/day</strong>
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
                    color: "var(--purple-dark, #8a4d8a)",
                  }}
                >
                  {calculatedPrice} EGP
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="proceed-button" onClick={handleProceedToPayment}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

ReserveVenueModal.propTypes = {
  venue: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onReserve: PropTypes.func.isRequired,
  categories: PropTypes.array,
  subcategories: PropTypes.array,
  isLoadingCategories: PropTypes.bool,
  isLoadingSubcategories: PropTypes.bool,
  onCategoryChange: PropTypes.func,
  calculatedPrice: PropTypes.number,
};

export default ReserveVenueModal;
