import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./Modal.module.css";
const getVenueImageUrl = (venue) => {
  if (!venue || !venue.images || venue.images.length === 0) {
    return "https://via.placeholder.com/200x150?text=Venue";
  }

  const imageUrl = Array.isArray(venue.images) ? venue.images[0] : venue.images;
  const filename = imageUrl.split("/").pop().split(",")[0].trim();

  return `https://connviabackend-production.up.railway.app/uploads/venues/${filename}`;
};

const VenueOwnerModal = ({ ownerId, onClose }) => {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        // Get the JWT token from localStorage
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }

        // Use the correct format for JWT token
        const response = await fetch(
          `https://connviabackend-production.up.railway.app/api/venues/owner/${ownerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Ensure Bearer format with correct token
            },
          }
        );

        // Special handling for 401/403 responses
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (response.ok && data && data.owner) {
          setOwner(data.owner);
        } else {
          setError(data.error || "Failed to load venue owner details");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Venue owner fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchOwnerDetails();
    }
  }, [ownerId]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Loading venue owner details...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <h3>Error</h3>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => {
                setLoading(true);
                setError(null);

                // Get the JWT token from localStorage
                const token = localStorage.getItem("authToken");

                if (!token) {
                  setError("Authentication required. Please log in again.");
                  setLoading(false);
                  return;
                }

                // Use direct fetch with proper token handling
                fetch(
                  `https://connviabackend-production.up.railway.app/api/venues/owner/${ownerId}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`, // Ensure Bearer format with correct token
                    },
                  }
                )
                  .then((response) => {
                    // Special handling for auth errors
                    if (response.status === 401 || response.status === 403) {
                      return response.text().then((text) => {
                        throw new Error(`Authentication failed: ${text}`);
                      });
                    }

                    return response.json();
                  })
                  .then((data) => {
                    if (data && data.owner) {
                      setOwner(data.owner);
                    } else {
                      setError(
                        data.error || "Failed to load venue owner details"
                      );
                    }
                  })
                  .catch((err) => {
                    console.error("Venue owner fetch error:", err);
                    setError(err.message || "An unexpected error occurred");
                  })
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </button>
          </div>
        ) : owner ? (
          <div className={styles.ownerDetailsContainer}>
            <div className={styles.ownerHeader}>
              {owner.logo && (
                <div className={styles.ownerLogoContainer}>
                  <img
                    src={`https://connviabackend-production.up.railway.app/uploads/logos/${owner.logo}`}
                    alt={`${owner.name} logo`}
                    className={styles.ownerLogo}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/100x100?text=Logo";
                    }}
                  />
                </div>
              )}
              <div className={styles.ownerInfo}>
                <h2 className={styles.ownerName}>{owner.name}</h2>
                <p className={styles.ownerTaxNumber}>
                  <span className={styles.label}>Tax Number:</span>{" "}
                  {owner.tax_number}
                </p>
              </div>
            </div>

            <div className={styles.ownerVenuesSection}>
              <h3 className={styles.sectionTitle}>Available Venues</h3>
              {owner.venues && owner.venues.length > 0 ? (
                <div className={styles.venueGrid}>
                  {owner.venues
                    .filter((venue) => venue.is_available)
                    .map((venue) => (
                      <div key={venue.id} className={styles.venueCard}>
                        <div className={styles.venueImageContainer}>
                          <img
                            src={getVenueImageUrl(venue)}
                            alt={venue.name}
                            className={styles.venueImage}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/200x150?text=Venue";
                            }}
                          />
                        </div>
                        <div className={styles.venueCardDetails}>
                          <h4 className={styles.venueCardTitle}>
                            {venue.name}
                          </h4>
                          <p className={styles.venueCardCategory}>
                            {venue.category || "Venue"}
                          </p>
                          <div className={styles.venueCardFooter}>
                            <span className={styles.venueCapacity}>
                              Capacity: {venue.capacity || 0}
                            </span>
                            <span className={styles.venuePrice}>
                              {venue.pricing_type === "hourly"
                                ? `${venue.cost_hourly || 0} EGP/hr`
                                : venue.pricing_type === "daily"
                                ? `${venue.cost_daily || 0} EGP/day`
                                : `${venue.cost_hourly || 0} EGP/hr | ${
                                    venue.cost_daily || 0
                                  } EGP/day`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className={styles.noVenuesMessage}>
                  No available venues found for this owner.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.notFoundContainer}>
            <p>Venue owner information not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

VenueOwnerModal.propTypes = {
  ownerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VenueOwnerModal;
