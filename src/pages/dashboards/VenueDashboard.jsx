// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import { toast, ToastContainer } from "react-toastify";
import { logoutUser } from "../../utils/authService";
import {
  addVenue,
  getMyVenues,
  getVenueDetails,
  updateVenue,
  deleteVenue,
} from "../../utils/venueService";
import { getVenueOwnerStats } from "../../utils/dashboardService";
import { getVenueOwnerReservations } from "../../utils/reservationService";
import DashboardHeader from "../../components/DashboardHeader";
import styles from "./VenueDashboard.module.css";
import "./VenueImageFix.css"; // Import the fix for double scrollbars
import "./VenueDeleteStyles.css"; // Import styles for delete venue functionality

// Initial dashboard data structure
const initialDashboardData = {
  earnings: {
    total: 0,
    percentChange: 0,
    isPositive: true,
  },
  bookings: {
    upcoming: 0,
    pending: 0,
  },
  venues: {
    total: 0,
  },
  recentBookings: [],
  notifications: [],
};

// Custom map marker component
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map location picker component
const LocationPicker = ({ location, setLocation }) => {
  // eslint-disable-next-line no-unused-vars
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setLocation({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    },
  });

  return (
    <Marker
      position={[parseFloat(location.lat), parseFloat(location.lng)]}
      icon={defaultIcon}
    />
  );
};

LocationPicker.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  setLocation: PropTypes.func.isRequired,
};

function VenueDashboard() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [showVenueDetailsModal, setShowVenueDetailsModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venueFormData, setVenueFormData] = useState({
    name: "",
    capacity: "<100",
    exactCapacity: "",
    amenities: {
      parking: false,
      wifi: false,
      airConditioning: false,
      security: false,
      catering: false,
      audioVisual: false,
      outdoorSpace: false,
      accessibleEntrance: false,
    },
    gates: 1,
    location: { lat: 30.0444, lng: 31.2357 }, // Default to Cairo
    pricingType: "hourly",
    hourlyRate: "",
    dailyRate: "",
    images: [],
    description: "",
    available_dates: "",
    category: "",
    rules: {
      noSmoking: false,
      noPets: false,
      noOutsideFood: false,
      noOutsideCatering: false,
      quietHours: false,
      noAlcohol: false,
      noConfetti: false,
      cleanupRequired: false,
      securityDeposit: false,
      capacityLimit: false,
    },
    otherRules: "",
    contact_email: "",
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [myVenues, setMyVenues] = useState([]);
  const fileInputRef = useRef(null);
  const newNotificationsCount = dashboardData.notifications.filter(
    (n) => n.isNew
  ).length;

  // Fetch venues and dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchVenues();
  }, []);

  // Update the selected venue when myVenues changes
  useEffect(() => {
    if (selectedVenue && !isEditMode) {
      // Find the updated venue in myVenues
      const updatedVenue = myVenues.find(
        (venue) => venue.venue_ID === selectedVenue.venue_ID
      );

      // If found, update the selected venue with the latest data
      if (updatedVenue) {
        setSelectedVenue(updatedVenue);
      }
    }
  }, [myVenues, selectedVenue, isEditMode]);

  // Handle view venue details
  const handleViewVenueDetails = async (venueId) => {
    try {
      setIsLoading(true);

      // Get venue details from the server
      const response = await getVenueDetails(venueId);

      if (response.success && response.data) {
        const venue = response.data;

        // Check if amenities are already in the response
        let venueAmenities = venue.amenities;
        if (!venueAmenities && venue.facilities) {
          // Parse amenities from facilities if not already parsed by the backend
          venueAmenities = {};
          if (typeof venue.facilities === "string") {
            try {
              const parsedFacilities = JSON.parse(venue.facilities);
              if (Array.isArray(parsedFacilities)) {
                parsedFacilities.forEach((facility) => {
                  if (typeof facility === "string") {
                    venueAmenities[facility] = true;
                  }
                });
              } else if (typeof parsedFacilities === "object") {
                Object.assign(venueAmenities, parsedFacilities);
              }
            } catch (e) {
              console.error("Error parsing facilities:", e);
            }
          }
        }

        // Check if rules are already in the response
        let venueRules = venue.rules;
        if (venueRules && typeof venueRules === "string") {
          // Parse rules if they're still a string
          try {
            const parsedRules = JSON.parse(venueRules);
            if (Array.isArray(parsedRules)) {
              venueRules = {};
              parsedRules.forEach((rule) => {
                if (typeof rule === "string") {
                  venueRules[rule] = true;
                }
              });
            } else if (typeof parsedRules === "object") {
              venueRules = parsedRules;
            }
          } catch (e) {
            console.error("Error parsing rules:", e);
          }
        }

        // Parse location data if it's a string
        let locationData = venue.location;
        if (typeof locationData === "string") {
          try {
            locationData = JSON.parse(locationData);
          } catch (e) {
            console.error("Error parsing location data:", e);
            // If parsing fails, create a default location object
            locationData = { lat: 30.0444, lng: 31.2357 }; // Default to Cairo
          }
        }

        // Set the selected venue with parsed data
        setSelectedVenue({
          ...venue,
          amenities: venueAmenities,
          rules: venueRules,
          location: locationData,
        });

        // For debugging
        console.log("Venue data for modal:", {
          ...venue,
          amenities: venueAmenities,
          rules: venueRules,
        });

        // Open the modal in view mode
        setShowVenueDetailsModal(true);
        setIsEditMode(false);
      } else {
        toast.error(response.error || "Failed to fetch venue details");
      }
    } catch (error) {
      console.error("Error viewing venue details:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit venue
  const handleEditVenue = (venue) => {
    setSelectedVenue(venue);
    setIsEditMode(true);

    // Initialize form data with venue details
    const amenities = {};
    if (venue.facilities && typeof venue.facilities === "string") {
      try {
        const parsedFacilities = JSON.parse(venue.facilities);
        if (Array.isArray(parsedFacilities)) {
          parsedFacilities.forEach((facility) => {
            if (typeof facility === "string") {
              amenities[facility] = true;
            }
          });
        } else if (typeof parsedFacilities === "object") {
          Object.assign(amenities, parsedFacilities);
        }
      } catch (e) {
        console.error("Error parsing facilities:", e);
      }
    }

    const rules = {};
    if (venue.rules && typeof venue.rules === "string") {
      try {
        const parsedRules = JSON.parse(venue.rules);
        if (Array.isArray(parsedRules)) {
          parsedRules.forEach((rule) => {
            if (typeof rule === "string") {
              rules[rule] = true;
            }
          });
        } else if (typeof parsedRules === "object") {
          Object.assign(rules, parsedRules);
        }
      } catch (e) {
        console.error("Error parsing rules:", e);
      }
    }

    // Parse location data if it's a string
    let locationData = venue.location;
    if (typeof locationData === "string") {
      try {
        locationData = JSON.parse(locationData);
      } catch (e) {
        console.error("Error parsing location data:", e);
        // If parsing fails, create a default location object
        locationData = { lat: 30.0444, lng: 31.2357 }; // Default to Cairo
      }
    }

    setEditFormData({
      ...venue,
      amenities,
      rules,
      location: locationData,
    });

    setShowVenueDetailsModal(true);
  };

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit form amenity checkbox changes
  const handleEditAmenityChange = (e) => {
    const { name, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked,
      },
    }));
  };

  // Handle edit form rule checkbox changes
  const handleEditRuleChange = (e) => {
    const { name, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [name]: checked,
      },
    }));
  };

  // Handle edit form image upload
  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setNewImages(files);
  };

  // Handle form submission for venue update
  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // Validate form
      if (
        !editFormData.name ||
        !editFormData.capacity ||
        !editFormData.description ||
        !editFormData.category ||
        !editFormData.contact_email
      ) {
        setFormError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission
      const venueData = {
        ...editFormData,
        newImages: newImages,
      };

      // Send update request
      const response = await updateVenue(editFormData.venue_ID, venueData);

      if (response.success) {
        toast.success("Venue updated successfully");

        // Update the venue in the myVenues array immediately
        const updatedVenues = myVenues.map((venue) => {
          if (venue.venue_ID === editFormData.venue_ID) {
            // Create updated venue object with all the edited data
            const updatedVenue = {
              ...venue,
              ...editFormData,
              // Format amenities and rules back to string format if needed
              facilities: editFormData.amenities
                ? JSON.stringify(
                    Object.keys(editFormData.amenities).filter(
                      (key) => editFormData.amenities[key]
                    )
                  )
                : venue.facilities,
              rules: editFormData.rules
                ? JSON.stringify(
                    Object.keys(editFormData.rules).filter(
                      (key) => editFormData.rules[key]
                    )
                  )
                : venue.rules,
              // Ensure location is properly formatted
              location:
                typeof editFormData.location === "string"
                  ? editFormData.location
                  : JSON.stringify(editFormData.location || {}),
            };

            // If new images were uploaded, they'll be handled by the backend
            // and we'll get them in the next fetchVenues call
            return updatedVenue;
          }
          return venue;
        });

        // Update state with the modified venues
        setMyVenues(updatedVenues);

        // If the selected venue is the one being edited, update it too
        if (selectedVenue && selectedVenue.venue_ID === editFormData.venue_ID) {
          setSelectedVenue({
            ...selectedVenue,
            ...editFormData,
            // Format amenities and rules back to string format if needed
            facilities: editFormData.amenities
              ? JSON.stringify(
                  Object.keys(editFormData.amenities).filter(
                    (key) => editFormData.amenities[key]
                  )
                )
              : selectedVenue.facilities,
            rules: editFormData.rules
              ? JSON.stringify(
                  Object.keys(editFormData.rules).filter(
                    (key) => editFormData.rules[key]
                  )
                )
              : selectedVenue.rules,
            // Ensure location is properly formatted
            location:
              typeof editFormData.location === "string"
                ? editFormData.location
                : JSON.stringify(editFormData.location || {}),
          });
        }

        // Close modal and reset form state
        setShowVenueDetailsModal(false);
        setIsEditMode(false);
        setEditFormData({});
        setNewImages([]);

        // Also fetch venues from server to ensure we have the latest data
        // especially for image updates which we can't handle on the client side
        fetchVenues();
      } else {
        // Show detailed error message
        const errorMessage = response.error || "Failed to update venue";
        const detailsMessage = response.details ? `: ${response.details}` : "";
        const errorCode = response.code ? ` (Code: ${response.code})` : "";

        // Log detailed error information
        console.error("Venue update failed:", {
          error: errorMessage,
          details: response.details,
          code: response.code,
          sqlState: response.sqlState,
          status: response.status,
        });

        // Display error to user
        toast.error(`${errorMessage}${detailsMessage}${errorCode}`);
        setFormError(`${errorMessage}${detailsMessage}`);
      }
    } catch (error) {
      console.error("Error updating venue:", error);
      setFormError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle delete mode
  const toggleDeleteMode = () => {
    setIsDeleteMode((prevState) => !prevState);
    if (isDeleteMode) {
      setVenueToDelete(null);
    }
  };

  // Handle venue selection for deletion
  const handleSelectVenueForDeletion = (venue) => {
    if (isDeleteMode) {
      setVenueToDelete(venue);
      setShowDeleteConfirmModal(true);
    }
  };

  // Handle delete venue
  const handleDeleteVenue = async () => {
    if (!venueToDelete) return;

    try {
      setIsLoading(true);
      const response = await deleteVenue(venueToDelete.venue_ID);

      // Always close the modal first
      setShowDeleteConfirmModal(false);

      if (response.success) {
        // Remove the venue from the myVenues array
        const updatedVenues = myVenues.filter(
          (venue) => venue.venue_ID !== venueToDelete.venue_ID
        );
        setMyVenues(updatedVenues);

        // Reset delete mode
        setIsDeleteMode(false);
        setVenueToDelete(null);

        // Show success message
        toast.success("Venue deleted successfully!");
      } else {
        console.log("Delete venue error response:", response);

        // Check for foreign key constraint error
        if (
          response.details &&
          response.details.includes("foreign key constraint")
        ) {
          // Use consistent toast styling with the success toast, just with red text
          toast.error("Cannot delete venue because it's currently reserved");
        } else {
          // For other errors
          toast.error(response.error || "Failed to delete venue");
        }
      }
    } catch (error) {
      console.error("Error deleting venue:", error);
      setShowDeleteConfirmModal(false);

      // Show toast notification for unexpected errors
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle venue details modal
  const toggleVenueDetailsModal = () => {
    setShowVenueDetailsModal(!showVenueDetailsModal);
    if (showVenueDetailsModal) {
      setSelectedVenue(null);
      setIsEditMode(false);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch venue owner stats
      const statsResponse = await getVenueOwnerStats();
      console.log("Dashboard stats response:", statsResponse);

      // Fetch venue owner reservations (bookings)
      const reservationsResponse = await getVenueOwnerReservations();
      console.log("Reservations response:", reservationsResponse);

      // Process recent bookings data
      let recentBookings = [];
      if (
        reservationsResponse.success &&
        reservationsResponse.data &&
        reservationsResponse.data.reservations
      ) {
        recentBookings = reservationsResponse.data.reservations.map(
          (booking) => ({
            id: booking.reservation_ID,
            venueName: booking.venue_name || "Unknown Venue",
            startDate: new Date(booking.start_date).toLocaleDateString(),
            endDate: booking.end_date
              ? new Date(booking.end_date).toLocaleDateString()
              : null,
            client:
              booking.organizer_company ||
              booking.organizer_name ||
              "Unknown Client",
            status: booking.payment_status || "Pending",
          })
        );
      }

      if (statsResponse.success && statsResponse.data) {
        // Update dashboard data with the stats from the API
        setDashboardData((prev) => ({
          ...prev,
          earnings: {
            total: statsResponse.data.totalEarnings || 0,
          },
          bookings: {
            total: statsResponse.data.totalBookings || 0,
            upcoming: statsResponse.data.upcomingBookings || 0,
            pending: statsResponse.data.pendingBookings || 0,
          },
          venues: {
            total: statsResponse.data.totalVenues || 0,
          },
          recentBookings: recentBookings,
        }));

        // Update venues list if available
        if (statsResponse.data.venues && statsResponse.data.venues.length > 0) {
          setMyVenues(statsResponse.data.venues);
        }
      } else {
        setError(statsResponse.error || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching venue owner dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await getMyVenues();
      if (response.success && response.venues) {
        setMyVenues(response.venues);
        // Update dashboard data with venue count
        setDashboardData((prev) => ({
          ...prev,
          venues: {
            ...prev.venues,
            total: response.venues.length,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to load your venues");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleAddVenueModal = () => {
    setShowAddVenueModal(!showAddVenueModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVenueFormData({
      ...venueFormData,
      [name]: value,
    });
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setVenueFormData({
      ...venueFormData,
      amenities: {
        ...venueFormData.amenities,
        [name]: checked,
      },
    });
  };

  const handlePricingTypeChange = (e) => {
    setVenueFormData({
      ...venueFormData,
      pricingType: e.target.value,
    });
  };

  const handleLocationChange = (location) => {
    // This function will be used when the map component is integrated
    setVenueFormData({
      ...venueFormData,
      location,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Create new FileList with existing and new files
    const newImages = [...venueFormData.images, ...files];

    // Create preview URLs for the images
    const newImageUrls = files.map((file) => URL.createObjectURL(file));

    setVenueFormData({
      ...venueFormData,
      images: newImages,
    });

    setImagePreviewUrls([...imagePreviewUrls, ...newImageUrls]);
  };

  const removeImage = (index) => {
    const newImages = [...venueFormData.images];
    const newImageUrls = [...imagePreviewUrls];

    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);

    setVenueFormData({
      ...venueFormData,
      images: newImages,
    });

    setImagePreviewUrls(newImageUrls);
  };

  const handleRuleChange = (e) => {
    const { name, checked } = e.target;
    setVenueFormData({
      ...venueFormData,
      rules: {
        ...venueFormData.rules,
        [name]: checked,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};

    // Check required fields
    if (!venueFormData.name.trim()) {
      errors.name = "Venue name is required";
    }

    if (venueFormData.images.length === 0) {
      errors.images = "At least one image is required";
    }

    if (!venueFormData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!venueFormData.category) {
      errors.category = "Category is required";
    }

    if (!venueFormData.available_dates.trim()) {
      errors.available_dates = "Available dates information is required";
    }

    if (!venueFormData.contact_email.trim()) {
      errors.contact_email = "Contact email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(venueFormData.contact_email)) {
      errors.contact_email = "Please enter a valid email address";
    }

    // Check pricing fields
    if (venueFormData.pricingType === "hourly" && !venueFormData.hourlyRate) {
      errors.hourlyRate = "Hourly rate is required";
    }

    if (venueFormData.pricingType === "daily" && !venueFormData.dailyRate) {
      errors.dailyRate = "Daily rate is required";
    }

    if (venueFormData.capacity === ">5000" && !venueFormData.exactCapacity) {
      errors.exactCapacity = "Please specify an approximate capacity";
    }

    // Update validation errors
    setValidationErrors(errors);

    // If there are errors, don't submit the form
    if (Object.keys(errors).length > 0) {
      // Scroll to the first error
      const firstErrorElement = document.querySelector(`.${styles.errorText}`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // Reset messages
    setSubmitError("");
    setSubmitSuccess("");

    // Set submitting state
    setIsSubmitting(true);

    try {
      // Submit venue data to the server
      const response = await addVenue(venueFormData);

      if (response.success) {
        // Show success message with toast notification
        toast.success("Venue added successfully!");
        setSubmitSuccess("Venue added successfully!");

        // Reset form data
        setVenueFormData({
          name: "",
          capacity: "<100",
          exactCapacity: "",
          amenities: {
            parking: false,
            wifi: false,
            airConditioning: false,
            security: false,
            catering: false,
            audioVisual: false,
            outdoorSpace: false,
            accessibleEntrance: false,
          },
          gates: 1,
          location: { lat: 30.0444, lng: 31.2357 },
          pricingType: "hourly",
          hourlyRate: "",
          dailyRate: "",
          images: [],
          description: "",
          available_dates: "",
          category: "",
          rules: {
            noSmoking: false,
            noPets: false,
            noOutsideFood: false,
            noOutsideCatering: false,
            quietHours: false,
            noAlcohol: false,
            noConfetti: false,
            cleanupRequired: false,
            securityDeposit: false,
            capacityLimit: false,
          },
          otherRules: "",
          contact_email: "",
        });
        setImagePreviewUrls([]);
        setValidationErrors({});

        // Close the modal immediately to show the new venue
        toggleAddVenueModal();

        // Fetch updated venues immediately
        try {
          // Get the updated venues list
          const venuesResponse = await getMyVenues();

          if (
            venuesResponse.success &&
            venuesResponse.data &&
            Array.isArray(venuesResponse.data.venues)
          ) {
            // Update the venues list immediately with the correct data structure
            setMyVenues(venuesResponse.data.venues);

            // Update dashboard data with venue count
            setDashboardData((prev) => ({
              ...prev,
              venues: {
                ...prev.venues,
                total: venuesResponse.data.venues.length,
              },
            }));
          } else if (
            venuesResponse.success &&
            Array.isArray(venuesResponse.data)
          ) {
            // Alternative data structure
            setMyVenues(venuesResponse.data);

            // Update dashboard data with venue count
            setDashboardData((prev) => ({
              ...prev,
              venues: {
                ...prev.venues,
                total: venuesResponse.data.length,
              },
            }));
          } else if (venuesResponse.success && venuesResponse.venues) {
            // Another possible data structure
            setMyVenues(venuesResponse.venues);

            // Update dashboard data with venue count
            setDashboardData((prev) => ({
              ...prev,
              venues: {
                ...prev.venues,
                total: venuesResponse.venues.length,
              },
            }));
          }

          // Also update the dashboard statistics to reflect the new venue
          fetchDashboardData();
        } catch (error) {
          console.error("Error fetching updated venues:", error);
          toast.error(
            "Venue added but failed to refresh the list. Please refresh the page."
          );
        }
      } else {
        // Show detailed error message
        const errorMessage = response.error || "Failed to add venue";
        const detailsMessage = response.details ? `: ${response.details}` : "";
        const errorCode = response.code ? ` (Code: ${response.code})` : "";

        // Log detailed error information
        console.error("Venue creation failed:", {
          error: errorMessage,
          details: response.details,
          code: response.code,
          sqlState: response.sqlState,
          status: response.status,
        });

        // Display error to user
        toast.error(`${errorMessage}${detailsMessage}${errorCode}`);
        setSubmitError(`${errorMessage}${detailsMessage}`);
      }
    } catch (error) {
      console.error("Error adding venue:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
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
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Dashboard</h1>
            <p className={styles.welcomeText}>
              Welcome back to your venue management overview
            </p>
          </div>
          <div className={styles.venueActionButtons}>
            <button
              className={styles.newVenueButton}
              onClick={toggleAddVenueModal}
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
              Add New Venue
            </button>
          </div>
        </div>

        {/* Top Dashboard Cards */}
        <div className={styles.cardsGrid}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button
                onClick={fetchDashboardData}
                className={styles.retryButton}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
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
                    Total Earnings{" "}
                    <span className={styles.currencyLabel}>EGP</span>
                  </h3>
                  <div className={styles.cardValueContainer}>
                    <span className={styles.cardValue}>
                      {Math.round(
                        dashboardData.earnings.total
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Bookings Card */}
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
                    Upcoming Bookings
                  </h3>
                  <div className={styles.cardValueContainer}>
                    <span className={styles.cardValue}>
                      {dashboardData.bookings.upcoming}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Requests Card */}
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
                          d="M12 8V12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z"
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
                      {dashboardData.bookings.pending}
                    </span>
                  </div>
                </div>
              </div>

              {/* Venues Listed Card */}
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
                          d="M2 22H22M2 11H22M2 7H22M11 3H13M10 22V17.5C10 16.6716 10.6716 16 11.5 16H12.5C13.3284 16 14 16.6716 14 17.5V22M4 11V22M20 11V22M15 7C15 8.10457 14.1046 9 13 9H11C9.89543 9 9 8.10457 9 7V3H15V7Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                    Venues Listed
                  </h3>
                  <div className={styles.cardValueContainer}>
                    <span className={styles.cardValue}>
                      {dashboardData.venues.total}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions - Action button cards */}
        <div className={styles.actionsList}>
          <button className={styles.actionButton}>
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
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionText}>View Summary</span>
          </button>

          <button className={styles.actionButton}>
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
                  d="M9 17H15M9 13H15M9 9H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionText}>Manage Listings</span>
          </button>

          <button className={styles.actionButton}>
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
                  d="M12 15V15.01M12 12C12.01 11.9996 12.0199 11.9996 12.0299 12C12.0399 12.0005 12.0499 12.0005 12.0599 12C12.0699 11.9994 12.0799 11.9994 12.0899 12C12.0999 12.0006 12.1099 12.0006 12.12 12M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionText}>Download Reports</span>
          </button>
        </div>

        {/* Recent Bookings Section */}
        <div className={styles.sectionsGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Bookings</h2>
              <button className={styles.viewAllSectionButton}>View All</button>
            </div>

            <table className={styles.bookingsTable}>
              <thead>
                <tr>
                  <th>Venue Name</th>
                  <th>Reservation Date</th>
                  <th>Client</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentBookings &&
                dashboardData.recentBookings.length > 0 ? (
                  dashboardData.recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <h4 className={styles.bookingTitle}>
                          {booking.venueName || "N/A"}
                        </h4>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {booking.startDate}{" "}
                          {booking.endDate ? `- ${booking.endDate}` : ""}
                        </p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>
                          {booking.client || "Unknown Client"}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`${styles.bookingStatus} ${
                            booking.status === "confirmed" ||
                            booking.status === "Confirmed" ||
                            booking.status === "paid" ||
                            booking.status === "Paid"
                              ? styles.statusPaid
                              : booking.status === "pending" ||
                                booking.status === "Pending"
                              ? styles.statusPending
                              : booking.status === "cancelled" ||
                                booking.status === "Cancelled"
                              ? styles.statusCancelled
                              : ""
                          }`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.noBookingsMessage}>
                      No recent bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Venues Section */}
        <div className={styles.sectionsGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Venues</h2>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "10px" }}
              >
                <button
                  className={`${styles.deleteVenueButton} ${
                    isDeleteMode ? styles.deleteActive : ""
                  }`}
                  onClick={toggleDeleteMode}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isDeleteMode ? "Cancel" : "Delete Venue"}
                </button>
                <button
                  className={styles.viewAllSectionButton}
                  onClick={toggleAddVenueModal}
                >
                  Add New Venue
                </button>
              </div>
            </div>

            {myVenues.length > 0 ? (
              <div className={styles.simpleVenueGrid}>
                {myVenues.map((venue) => (
                  <div
                    key={venue.venue_ID}
                    className={`${styles.simpleVenueCard} ${
                      isDeleteMode ? styles.deleteSelectable : ""
                    }`}
                    onClick={() =>
                      isDeleteMode ? handleSelectVenueForDeletion(venue) : null
                    }
                  >
                    <div className={styles.simpleVenueImageContainer}>
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
                        className={styles.simpleVenueImage}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200";
                        }}
                      />
                    </div>
                    <div className={styles.simpleVenueInfo}>
                      <h3 className={styles.simpleVenueName}>{venue.name}</h3>
                      <p className={styles.simpleVenueCategory}>
                        {venue.category}
                      </p>
                      <div className={styles.simpleVenueDetails}>
                        <div className={styles.simpleVenueCapacity}>
                          <span className={styles.capacityIcon}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </span>
                          <span>Capacity: {venue.capacity}</span>
                        </div>
                        <div className={styles.simpleVenuePrice}>
                          <span className={styles.priceIcon}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2v20M17 5H7M19 12H5M17 19H7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                          {venue.pricing_type === "both" ? (
                            <div className={styles.bothPricesContainer}>
                              <span>{venue.cost_daily} EGP/day</span>
                              <span className={styles.secondaryPrice}>
                                {venue.cost_hourly} EGP/hr
                              </span>
                            </div>
                          ) : (
                            <span>
                              {venue.pricing_type === "hourly"
                                ? `${venue.cost_hourly} EGP/hr`
                                : `${venue.cost_daily} EGP/day`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.simpleVenueActions}>
                        <button
                          className={styles.simpleViewDetailsButton}
                          onClick={(e) => {
                            e.stopPropagation(); // Stop event propagation
                            handleViewVenueDetails(venue.venue_ID);
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          View Details
                        </button>
                        <button
                          className={styles.simpleEditButton}
                          onClick={(e) => {
                            e.stopPropagation(); // Stop event propagation
                            handleEditVenue(venue);
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noVenuesMessage}>
                <p>
                  You haven&apos;t added any venues yet. Click the &quot;Add New
                  Venue&quot; button to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Venue Details Modal */}
      {showVenueDetailsModal && selectedVenue && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditMode ? "Edit Venue" : "Venue Details"}
              </h2>
              <button
                className={styles.closeModalButton}
                onClick={toggleVenueDetailsModal}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className={styles.modalContent}>
              {isEditMode ? (
                <div className={styles.editVenueForm}>
                  <form onSubmit={handleUpdateVenue}>
                    <div className={styles.formSection}>
                      <h3 className={styles.formSectionTitle}>
                        Basic Information
                      </h3>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="name">Venue Name*</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={editFormData.name || ""}
                            onChange={handleEditFormChange}
                            required
                            className={styles.formInput}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="category">Category*</label>
                          <select
                            id="category"
                            name="category"
                            value={editFormData.category || ""}
                            onChange={handleEditFormChange}
                            required
                            className={styles.formSelect}
                          >
                            <option value="">Select a category</option>
                            <option value="conference">Conference Room</option>
                            <option value="outdoor">Outdoor Space</option>
                            <option value="hall">Hall</option>
                            <option value="studio">Studio</option>
                            <option value="theater">Theater</option>
                            <option value="classroom">Classroom</option>
                            <option value="coworking">Coworking Space</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="description">Description*</label>
                        <textarea
                          id="description"
                          name="description"
                          value={editFormData.description || ""}
                          onChange={handleEditFormChange}
                          required
                          className={styles.formTextarea}
                          rows="4"
                        ></textarea>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h3 className={styles.formSectionTitle}>
                        Capacity & Pricing
                      </h3>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="capacity">Capacity (people)*</label>
                          <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={editFormData.capacity || ""}
                            onChange={handleEditFormChange}
                            required
                            min="1"
                            className={styles.formInput}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="pricing_type">Pricing Type*</label>
                          <select
                            id="pricing_type"
                            name="pricing_type"
                            value={editFormData.pricing_type || ""}
                            onChange={handleEditFormChange}
                            required
                            className={styles.formSelect}
                          >
                            <option value="">Select pricing type</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="both">Both</option>
                          </select>
                        </div>
                      </div>

                      {(editFormData.pricing_type === "hourly" ||
                        editFormData.pricing_type === "both") && (
                        <div className={styles.formGroup}>
                          <label htmlFor="cost_hourly">
                            Hourly Rate (EGP)*
                          </label>
                          <input
                            type="number"
                            id="cost_hourly"
                            name="cost_hourly"
                            value={editFormData.cost_hourly || ""}
                            onChange={handleEditFormChange}
                            required
                            min="1"
                            className={styles.formInput}
                          />
                        </div>
                      )}

                      {(editFormData.pricing_type === "daily" ||
                        editFormData.pricing_type === "both") && (
                        <div className={styles.formGroup}>
                          <label htmlFor="cost_daily">Daily Rate (EGP)*</label>
                          <input
                            type="number"
                            id="cost_daily"
                            name="cost_daily"
                            value={editFormData.cost_daily || ""}
                            onChange={handleEditFormChange}
                            required
                            min="1"
                            className={styles.formInput}
                          />
                        </div>
                      )}
                    </div>

                    <div className={styles.formSection}>
                      <h3 className={styles.formSectionTitle}>Amenities</h3>
                      <div className={styles.checkboxGroup}>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="wifi"
                            name="wifi"
                            checked={editFormData.amenities?.wifi || false}
                            onChange={handleEditAmenityChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="wifi">WiFi</label>
                        </div>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="parking"
                            name="parking"
                            checked={editFormData.amenities?.parking || false}
                            onChange={handleEditAmenityChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="parking">Parking</label>
                        </div>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="audioVisual"
                            name="audioVisual"
                            checked={
                              editFormData.amenities?.audioVisual || false
                            }
                            onChange={handleEditAmenityChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="audioVisual">
                            Audio/Visual Equipment
                          </label>
                        </div>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="catering"
                            name="catering"
                            checked={editFormData.amenities?.catering || false}
                            onChange={handleEditAmenityChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="catering">Catering Available</label>
                        </div>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="accessibility"
                            name="accessibility"
                            checked={
                              editFormData.amenities?.accessibility || false
                            }
                            onChange={handleEditAmenityChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="accessibility">
                            Wheelchair Accessible
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h3 className={styles.formSectionTitle}>Rules</h3>
                      <div className={styles.checkboxGroup}>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="noSmoking"
                            name="noSmoking"
                            checked={editFormData.rules?.noSmoking || false}
                            onChange={handleEditRuleChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="noSmoking">No Smoking</label>
                        </div>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="noPets"
                            name="noPets"
                            checked={editFormData.rules?.noPets || false}
                            onChange={handleEditRuleChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="noPets">No Pets</label>
                        </div>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="noAlcohol"
                            name="noAlcohol"
                            checked={editFormData.rules?.noAlcohol || false}
                            onChange={handleEditRuleChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="noAlcohol">No Alcohol</label>
                        </div>
                        <div className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            id="capacityLimit"
                            name="capacityLimit"
                            checked={editFormData.rules?.capacityLimit || false}
                            onChange={handleEditRuleChange}
                            className={styles.formCheckbox}
                          />
                          <label htmlFor="capacityLimit">
                            Capacity Limit Enforced
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h3 className={styles.formSectionTitle}>
                        Contact & Availability
                      </h3>
                      <div className={styles.formGroup}>
                        <label htmlFor="contact_email">Contact Email*</label>
                        <input
                          type="email"
                          id="contact_email"
                          name="contact_email"
                          value={editFormData.contact_email || ""}
                          onChange={handleEditFormChange}
                          required
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="available_dates">
                          Availability Information*
                        </label>
                        <textarea
                          id="available_dates"
                          name="available_dates"
                          value={editFormData.available_dates || ""}
                          onChange={handleEditFormChange}
                          required
                          className={styles.formTextarea}
                          rows="3"
                          placeholder="E.g., Monday-Friday, 9am-5pm or specific dates"
                        ></textarea>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h3 className={styles.formSectionTitle}>Images</h3>
                      <div className={styles.venueImagePreview}>
                        {editFormData.images && (
                          <img
                            src={
                              typeof editFormData.images === "string"
                                ? `https://connviabackend-production.up.railway.app/uploads/venues/${editFormData.images
                                    .split("/")
                                    .pop()
                                    .split(",")[0]
                                    .trim()}`
                                : Array.isArray(editFormData.images) &&
                                  editFormData.images[0]
                                ? `https://connviabackend-production.up.railway.app/uploads/venues/${editFormData.images[0]
                                    .split("/")
                                    .pop()
                                    .split(",")[0]
                                    .trim()}`
                                : "https://via.placeholder.com/800x400?text=Venue+Image"
                            }
                            alt="Venue preview"
                            className={styles.modalImage}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/800x400?text=Venue+Image";
                            }}
                          />
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <input
                          type="file"
                          id="newImages"
                          name="newImages"
                          onChange={handleEditImageUpload}
                          multiple
                          accept="image/*"
                          className={styles.formFileInput}
                        />
                        <label htmlFor="newImages">Browse...</label>
                        <p className={styles.formHelperText}>
                          You can select multiple images. Current images will be
                          kept unless you upload new ones.
                        </p>
                      </div>
                    </div>

                    {formError && (
                      <div className={styles.formError}>{formError}</div>
                    )}

                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={toggleVenueDetailsModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className={styles.venueDetailsContent}>
                  {/* Venue images */}
                  <div className={styles.venueDetailsImageGallery}>
                    {selectedVenue.images &&
                    (Array.isArray(selectedVenue.images)
                      ? selectedVenue.images.length > 0
                      : selectedVenue.images) ? (
                      <img
                        src={
                          typeof selectedVenue.images === "string"
                            ? `https://connviabackend-production.up.railway.app/uploads/venues/${selectedVenue.images
                                .split("/")
                                .pop()
                                .split(",")[0]
                                .trim()}`
                            : Array.isArray(selectedVenue.images) &&
                              selectedVenue.images[0]
                            ? `https://connviabackend-production.up.railway.app/uploads/venues/${selectedVenue.images[0]
                                .split("/")
                                .pop()
                                .split(",")[0]
                                .trim()}`
                            : "https://via.placeholder.com/800x400?text=Venue+Image"
                        }
                        alt={selectedVenue.name}
                        className={styles.venueDetailsMainImage}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/800x400?text=Venue+Image";
                        }}
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/800x400?text=No+Image+Available"
                        alt="No image available"
                        className={styles.venueDetailsMainImage}
                      />
                    )}
                  </div>

                  {/* Venue details sections */}
                  <div className={styles.venueDetailsInfo}>
                    <h3 className={styles.venueDetailsName}>
                      {selectedVenue.name}
                    </h3>
                    <p className={styles.venueDetailsCategory}>
                      {selectedVenue.category}
                    </p>

                    <div className={styles.venueDetailsSection}>
                      <h4 className={styles.venueDetailsSectionTitle}>
                        Description
                      </h4>
                      <p className={styles.venueDetailsDescription}>
                        {selectedVenue.description ||
                          "No description available"}
                      </p>
                    </div>

                    <div className={styles.venueDetailsSection}>
                      <h4 className={styles.venueDetailsSectionTitle}>
                        Capacity
                      </h4>
                      <p className={styles.venueDetailsCapacity}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            marginRight: "8px",
                            color: "var(--purple-light, #a262a2)",
                          }}
                        >
                          <path
                            d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        {selectedVenue.capacity} people
                      </p>
                    </div>

                    <div className={styles.venueDetailsSection}>
                      <h4 className={styles.venueDetailsSectionTitle}>
                        Pricing
                      </h4>
                      <div className={styles.venueDetailsPricing}>
                        {selectedVenue.pricing_type === "hourly" ||
                        selectedVenue.pricing_type === "both" ? (
                          <p className={styles.venueDetailsPricingItem}>
                            <span className={styles.venueDetailsPricingLabel}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginRight: "8px" }}
                              >
                                <path
                                  d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Hourly Rate:
                            </span>
                            <span className={styles.venueDetailsPricingValue}>
                              {selectedVenue.cost_hourly} EGP/hour
                            </span>
                          </p>
                        ) : null}

                        {selectedVenue.pricing_type === "daily" ||
                        selectedVenue.pricing_type === "both" ? (
                          <p className={styles.venueDetailsPricingItem}>
                            <span className={styles.venueDetailsPricingLabel}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginRight: "8px" }}
                              >
                                <path
                                  d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Daily Rate:
                            </span>
                            <span className={styles.venueDetailsPricingValue}>
                              {selectedVenue.cost_daily} EGP/day
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.venueDetailsSection}>
                      <h4 className={styles.venueDetailsSectionTitle}>
                        Amenities
                      </h4>
                      <div className={styles.venueDetailsAmenities}>
                        {selectedVenue.amenities &&
                        typeof selectedVenue.amenities === "object" &&
                        Object.entries(selectedVenue.amenities).length > 0 ? (
                          Object.entries(selectedVenue.amenities).map(
                            ([key, value]) => {
                              // Skip if value is false
                              if (!value) return null;

                              // Format the display text
                              let displayText = key;

                              // Handle numeric keys (amenity0, amenity1) or keys that are just numbers
                              if (
                                key.startsWith("amenity") &&
                                /\d+$/.test(key)
                              ) {
                                displayText = value.toString();
                              } else if (/^\d+$/.test(key)) {
                                // If key is just a number
                                displayText = value.toString();
                              } else if (key === "wifi") {
                                displayText = "WiFi";
                              } else if (key === "audioVisual") {
                                displayText = "Audio Visual Equipment";
                              } else if (key === "parking") {
                                displayText = "Parking Available";
                              } else {
                                // Format camelCase to Title Case with spaces
                                displayText = key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase());
                              }

                              return (
                                <span
                                  key={key}
                                  className={styles.venueDetailsAmenity}
                                >
                                  {displayText}
                                </span>
                              );
                            }
                          )
                        ) : (
                          <p>No amenities information available</p>
                        )}
                      </div>
                    </div>

                    <div className={styles.venueDetailsSection}>
                      <h4 className={styles.venueDetailsSectionTitle}>Rules</h4>
                      <div className={styles.venueDetailsRules}>
                        {selectedVenue.rules &&
                        typeof selectedVenue.rules === "object" &&
                        Object.entries(selectedVenue.rules).length > 0 ? (
                          Object.entries(selectedVenue.rules).map(
                            ([key, value]) => {
                              // Skip if value is false
                              if (!value) return null;

                              // Format the display text
                              let displayText = key;

                              // Handle numeric keys (rule0, rule1) or keys that are just numbers
                              if (key.startsWith("rule") && /\d+$/.test(key)) {
                                displayText = value.toString();
                              } else if (/^\d+$/.test(key)) {
                                // If key is just a number
                                displayText = value.toString();
                              } else if (key === "noSmoking") {
                                displayText = "No Smoking";
                              } else if (key === "noPets") {
                                displayText = "No Pets Allowed";
                              } else if (key === "noAlcohol") {
                                displayText = "No Alcohol";
                              } else if (key === "capacityLimit") {
                                displayText = "Capacity Limit Enforced";
                              } else {
                                // Format camelCase to Title Case with spaces
                                displayText = key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase());
                              }

                              return (
                                <div
                                  key={key}
                                  className={styles.venueDetailsRule}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9 12L11 14L15 10M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {displayText}
                                </div>
                              );
                            }
                          )
                        ) : (
                          <p>No rules information available</p>
                        )}
                      </div>
                    </div>

                    <div className={styles.venueDetailsSection}>
                      <h4 className={styles.venueDetailsSectionTitle}>
                        Contact
                      </h4>
                      <div className={styles.venueDetailsContact}>
                        <div className={styles.venueDetailsContactItem}>
                          <span className={styles.venueDetailsContactIcon}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          {selectedVenue.contact_email || "No email available"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.venueDetailsActions}>
              {!isEditMode && (
                <button
                  className={styles.editVenueButton}
                  onClick={() => handleEditVenue(selectedVenue)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Edit Venue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.modalContainer} ${styles.deleteConfirmModal}`}
          >
            <div className={styles.modalHeader}>
              <h2>Confirm Deletion</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowDeleteConfirmModal(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to delete the venue{" "}
                <strong>{venueToDelete?.name}</strong>?
              </p>
              <p className={styles.warningText}>
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="purpleButton"
                onClick={handleDeleteVenue}
                style={{
                  backgroundColor: "#a262a2",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#8a4f8a")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#a262a2")
                }
              >
                Delete Venue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Venue Modal */}
      {showAddVenueModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Venue</h2>
              <button
                className={styles.closeModalButton}
                onClick={toggleAddVenueModal}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <form className={styles.venueForm} onSubmit={handleSubmit}>
              {submitError && (
                <div className={styles.errorMessage}>
                  <p>{submitError}</p>
                </div>
              )}

              {submitSuccess && (
                <div className={styles.successMessage}>
                  <p>{submitSuccess}</p>
                </div>
              )}

              {/* Image Upload Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Venue Images</h3>
                <p className={styles.sectionDescription}>
                  Add at least one image of your venue
                </p>

                <div className={styles.imageUploadContainer}>
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className={styles.imagePreviewContainer}>
                      <img
                        src={url}
                        alt={`Venue preview ${index + 1}`}
                        className={styles.imagePreview}
                      />
                      <button
                        type="button"
                        className={styles.removeImageButton}
                        onClick={() => removeImage(index)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className={styles.addImageButton}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg
                      width="24"
                      height="24"
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
                    Add Image
                  </button>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </div>

                {(venueFormData.images.length === 0 ||
                  validationErrors.images) && (
                  <p
                    className={`${styles.imageRequiredText} ${
                      validationErrors.images ? styles.errorText : ""
                    }`}
                  >
                    * At least one image is required
                  </p>
                )}
              </div>

              {/* Basic Information */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Basic Information</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="venueName" className={styles.formLabel}>
                    Venue Name
                  </label>
                  <input
                    type="text"
                    id="venueName"
                    name="name"
                    className={`${styles.formInput} ${
                      validationErrors.name ? styles.inputError : ""
                    }`}
                    value={venueFormData.name}
                    onChange={handleInputChange}
                    required
                  />
                  {validationErrors.name && (
                    <p className={styles.errorText}>{validationErrors.name}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="capacity" className={styles.formLabel}>
                    Capacity
                  </label>
                  <select
                    id="capacity"
                    name="capacity"
                    className={styles.formInput}
                    value={venueFormData.capacity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Select capacity range
                    </option>
                    <option value="<100">Less than 100</option>
                    <option value="100-200">100 - 200</option>
                    <option value="201-500">201 - 500</option>
                    <option value="501-1000">501 - 1000</option>
                    <option value="1001-2000">1001 - 2000</option>
                    <option value="2001-5000">2001 - 5000</option>
                    <option value=">5000">More than 5000</option>
                  </select>
                </div>

                {venueFormData.capacity === ">5000" && (
                  <div className={styles.formGroup}>
                    <label htmlFor="exactCapacity" className={styles.formLabel}>
                      Approximate Capacity
                    </label>
                    <input
                      type="number"
                      id="exactCapacity"
                      name="exactCapacity"
                      className={`${styles.formInput} ${
                        validationErrors.exactCapacity ? styles.inputError : ""
                      }`}
                      value={venueFormData.exactCapacity}
                      onChange={handleInputChange}
                      placeholder="Enter an approximate number"
                      required={venueFormData.capacity === ">5000"}
                      min="5001"
                    />
                    {validationErrors.exactCapacity && (
                      <p className={styles.errorText}>
                        {validationErrors.exactCapacity}
                      </p>
                    )}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="gates" className={styles.formLabel}>
                    Number of Gates/Entrances
                  </label>
                  <input
                    type="number"
                    id="gates"
                    name="gates"
                    className={styles.formInput}
                    value={venueFormData.gates}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              {/* Amenities Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Amenities</h3>
                <p className={styles.sectionDescription}>
                  Select all amenities that your venue offers
                </p>

                <div className={styles.amenitiesGrid}>
                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="parking"
                      name="parking"
                      checked={venueFormData.amenities.parking}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="parking">Parking</label>
                  </div>

                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="wifi"
                      name="wifi"
                      checked={venueFormData.amenities.wifi}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="wifi">Wi-Fi</label>
                  </div>

                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="airConditioning"
                      name="airConditioning"
                      checked={venueFormData.amenities.airConditioning}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="airConditioning">Air Conditioning</label>
                  </div>

                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="security"
                      name="security"
                      checked={venueFormData.amenities.security}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="security">Security</label>
                  </div>

                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="catering"
                      name="catering"
                      checked={venueFormData.amenities.catering}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="catering">Catering Services</label>
                  </div>

                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="audioVisual"
                      name="audioVisual"
                      checked={venueFormData.amenities.audioVisual}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="audioVisual">Audio/Visual Equipment</label>
                  </div>

                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="outdoorSpace"
                      name="outdoorSpace"
                      checked={venueFormData.amenities.outdoorSpace}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="outdoorSpace">Outdoor Space</label>
                  </div>

                  <div className={styles.amenityCheckbox}>
                    <input
                      type="checkbox"
                      id="accessibleEntrance"
                      name="accessibleEntrance"
                      checked={venueFormData.amenities.accessibleEntrance}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor="accessibleEntrance">
                      Accessible Entrance
                    </label>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Venue Description</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.formLabel}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`${styles.formInput} ${styles.textarea} ${
                      validationErrors.description ? styles.inputError : ""
                    }`}
                    value={venueFormData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your venue, its unique features, and what makes it special"
                    rows={4}
                    required
                  ></textarea>
                  {validationErrors.description && (
                    <p className={styles.errorText}>
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="category" className={styles.formLabel}>
                    Venue Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className={`${styles.formInput} ${
                      validationErrors.category ? styles.inputError : ""
                    }`}
                    value={venueFormData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Select venue category
                    </option>
                    <option value="wedding">Wedding Venue</option>
                    <option value="conference">Conference Center</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel Ballroom</option>
                    <option value="outdoor">Outdoor Space</option>
                    <option value="studio">Studio</option>
                    <option value="theater">Theater</option>
                    <option value="sports">Sports Facility</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.category && (
                    <p className={styles.errorText}>
                      {validationErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Available Dates Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Availability</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="available_dates" className={styles.formLabel}>
                    Available Dates
                  </label>
                  <textarea
                    id="available_dates"
                    name="available_dates"
                    className={`${styles.formInput} ${styles.textarea} ${
                      validationErrors.available_dates ? styles.inputError : ""
                    }`}
                    value={venueFormData.available_dates}
                    onChange={handleInputChange}
                    placeholder="Specify your venue's availability (e.g., 'Available all weekdays from 9AM-5PM, weekends upon request')"
                    rows={3}
                    required
                  ></textarea>
                  {validationErrors.available_dates && (
                    <p className={styles.errorText}>
                      {validationErrors.available_dates}
                    </p>
                  )}
                </div>
              </div>

              {/* Rules Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Venue Rules & Contact</h3>

                <div className={styles.formGroup}>
                  <div className={styles.rulesGrid}>
                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="noSmoking"
                        name="noSmoking"
                        checked={venueFormData.rules.noSmoking}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="noSmoking">
                        <span className={styles.ruleIcon}>🚭</span>
                        No Smoking
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="noPets"
                        name="noPets"
                        checked={venueFormData.rules.noPets}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="noPets">
                        <span className={styles.ruleIcon}>🐾</span>
                        No Pets
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="noOutsideFood"
                        name="noOutsideFood"
                        checked={venueFormData.rules.noOutsideFood}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="noOutsideFood">
                        <span className={styles.ruleIcon}>🍔</span>
                        No Outside Food
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="noOutsideCatering"
                        name="noOutsideCatering"
                        checked={venueFormData.rules.noOutsideCatering}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="noOutsideCatering">
                        <span className={styles.ruleIcon}>👨‍🍳</span>
                        No Outside Catering
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="quietHours"
                        name="quietHours"
                        checked={venueFormData.rules.quietHours}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="quietHours">
                        <span className={styles.ruleIcon}>🔇</span>
                        Quiet Hours Policy
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="noAlcohol"
                        name="noAlcohol"
                        checked={venueFormData.rules.noAlcohol}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="noAlcohol">
                        <span className={styles.ruleIcon}>🍷</span>
                        No Alcohol
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="noConfetti"
                        name="noConfetti"
                        checked={venueFormData.rules.noConfetti}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="noConfetti">
                        <span className={styles.ruleIcon}>🎊</span>
                        No Confetti/Glitter
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="cleanupRequired"
                        name="cleanupRequired"
                        checked={venueFormData.rules.cleanupRequired}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="cleanupRequired">
                        <span className={styles.ruleIcon}>🧹</span>
                        Cleanup Required
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="securityDeposit"
                        name="securityDeposit"
                        checked={venueFormData.rules.securityDeposit}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="securityDeposit">
                        <span className={styles.ruleIcon}>💰</span>
                        Security Deposit
                      </label>
                    </div>

                    <div className={styles.ruleCheckbox}>
                      <input
                        type="checkbox"
                        id="capacityLimit"
                        name="capacityLimit"
                        checked={venueFormData.rules.capacityLimit}
                        onChange={handleRuleChange}
                      />
                      <label htmlFor="capacityLimit">
                        <span className={styles.ruleIcon}>👥</span>
                        Strict Capacity Limit
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="otherRules" className={styles.formLabel}>
                    Other Rules (Optional)
                  </label>
                  <textarea
                    id="otherRules"
                    name="otherRules"
                    className={`${styles.formInput} ${styles.textarea}`}
                    value={venueFormData.otherRules}
                    onChange={handleInputChange}
                    placeholder="Add any additional rules or policies not covered above"
                    rows={2}
                  ></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contact_email" className={styles.formLabel}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    className={`${styles.formInput} ${
                      validationErrors.contact_email ? styles.inputError : ""
                    }`}
                    value={venueFormData.contact_email}
                    onChange={handleInputChange}
                    placeholder="Enter email address for booking inquiries"
                    required
                  />
                  {validationErrors.contact_email && (
                    <p className={styles.errorText}>
                      {validationErrors.contact_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Location Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Location</h3>
                <p className={styles.sectionDescription}>
                  Select your venue&apos;s location on the map
                </p>

                <div className={styles.mapContainer}>
                  <MapContainer
                    center={[
                      parseFloat(venueFormData.location.lat),
                      parseFloat(venueFormData.location.lng),
                    ]}
                    zoom={13}
                    style={{ height: "300px", width: "100%" }}
                  >
                    <TileLayer
                      attribution={`&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors`}
                      url={`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`}
                    />
                    <LocationPicker
                      location={venueFormData.location}
                      setLocation={(location) => handleLocationChange(location)}
                    />
                  </MapContainer>
                </div>

                <div className={styles.mapPin}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Selected Location:
                </div>
                <div className={styles.mapCoordinates}>
                  Latitude: {venueFormData.location.lat}, Longitude:{" "}
                  {venueFormData.location.lng}
                </div>
              </div>

              {/* Pricing Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Pricing</h3>

                <div className={styles.pricingTypeSelector}>
                  <div>
                    <input
                      type="radio"
                      id="hourly"
                      name="pricingType"
                      value="hourly"
                      checked={venueFormData.pricingType === "hourly"}
                      onChange={handlePricingTypeChange}
                    />
                    <label htmlFor="hourly">Hourly Rate</label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="daily"
                      name="pricingType"
                      value="daily"
                      checked={venueFormData.pricingType === "daily"}
                      onChange={handlePricingTypeChange}
                    />
                    <label htmlFor="daily">Daily Rate</label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="both"
                      name="pricingType"
                      value="both"
                      checked={venueFormData.pricingType === "both"}
                      onChange={handlePricingTypeChange}
                    />
                    <label htmlFor="both">Both Options</label>
                  </div>
                </div>

                {(venueFormData.pricingType === "hourly" ||
                  venueFormData.pricingType === "both") && (
                  <div className={styles.formGroup}>
                    <label htmlFor="hourlyRate" className={styles.formLabel}>
                      Hourly Rate (EGP)
                    </label>
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      className={`${styles.formInput} ${
                        validationErrors.hourlyRate ? styles.inputError : ""
                      }`}
                      value={venueFormData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="Enter hourly rate in EGP"
                      min="0"
                      step="0.01"
                      required={venueFormData.pricingType === "hourly"}
                    />
                    {validationErrors.hourlyRate && (
                      <p className={styles.errorText}>
                        {validationErrors.hourlyRate}
                      </p>
                    )}
                  </div>
                )}

                {(venueFormData.pricingType === "daily" ||
                  venueFormData.pricingType === "both") && (
                  <div className={styles.formGroup}>
                    <label htmlFor="dailyRate" className={styles.formLabel}>
                      Daily Rate (EGP)
                    </label>
                    <input
                      type="number"
                      id="dailyRate"
                      name="dailyRate"
                      className={`${styles.formInput} ${
                        validationErrors.dailyRate ? styles.inputError : ""
                      }`}
                      value={venueFormData.dailyRate}
                      onChange={handleInputChange}
                      placeholder="Enter daily rate in EGP"
                      min="0"
                      step="0.01"
                      required={venueFormData.pricingType === "daily"}
                    />
                    {validationErrors.dailyRate && (
                      <p className={styles.errorText}>
                        {validationErrors.dailyRate}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={toggleAddVenueModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding Venue..." : "Add Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenueDashboard;
