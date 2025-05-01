// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';
import { logoutUser } from '../../utils/authService';
import { addVenue, getMyVenues } from '../../utils/venueService';
import DashboardHeader from '../../components/DashboardHeader';
import styles from './VenueDashboard.module.css';

// Mock data for the dashboard
const mockData = {
  earnings: {
    total: 12450,
    percentChange: 12.5,
    isPositive: true
  },
  bookings: {
    upcoming: 24,
    pending: 8
  },
  venues: {
    total: 5
  },
  upcomingBookings: [
    {
      id: 1,
      eventTitle: 'Summer Wedding',
      clientName: 'Emma Smith',
      dateTime: '2025-04-20 at 15:00',
      venue: 'Garden Hall',
      status: 'Confirmed'
    },
    {
      id: 2,
      eventTitle: 'Tech Conference',
      clientName: 'John Doe',
      dateTime: '2025-04-25 at 09:00',
      venue: 'Conference Center',
      status: 'Pending'
    },
    {
      id: 3,
      eventTitle: 'Birthday Party',
      clientName: 'Sarah Johnson',
      dateTime: '2025-05-01 at 18:00',
      venue: 'Rooftop Lounge',
      status: 'Confirmed'
    }
  ],
  notifications: [
    {
      id: 1,
      message: 'New booking request for Cairo Garden',
      time: '5m ago',
      isNew: true
    },
    {
      id: 2,
      message: 'Booking for Tech Conference confirmed',
      time: '1h ago',
      isNew: true
    },
    {
      id: 3,
      message: 'Message from Event Creator Alex',
      time: '2h ago',
      isNew: false
    },
    {
      id: 4,
      message: 'Payment received for Wedding Booking',
      time: '3h ago',
      isNew: false
    }
  ]
};

// Custom map marker component
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map location picker component
const LocationPicker = ({ location, setLocation }) => {
  // eslint-disable-next-line no-unused-vars
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setLocation({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    }
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
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  setLocation: PropTypes.func.isRequired
};

function VenueDashboard() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    capacity: '<100',
    exactCapacity: '',
    amenities: {
      parking: false,
      wifi: false,
      airConditioning: false,
      security: false,
      catering: false,
      audioVisual: false,
      outdoorSpace: false,
      accessibleEntrance: false
    },
    gates: 1,
    location: { lat: 30.0444, lng: 31.2357 }, // Default to Cairo
    pricingType: 'hourly',
    hourlyRate: '',
    dailyRate: '',
    images: [],
    description: '',
    available_dates: '',
    category: '',
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
      capacityLimit: false
    },
    otherRules: '',
    contact_email: ''
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [userVenues, setUserVenues] = useState([]);
  const fileInputRef = useRef(null);
  const newNotificationsCount = mockData.notifications.filter(n => n.isNew).length;

  // Fetch user's venues when component mounts
  useEffect(() => {
    const fetchVenues = async () => {
      const response = await getMyVenues();
      if (response.success && response.data && response.data.venues) {
        setUserVenues(response.data.venues);
      }
    };
    
    fetchVenues();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
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
      [name]: value
    });
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setVenueFormData({
      ...venueFormData,
      amenities: {
        ...venueFormData.amenities,
        [name]: checked
      }
    });
  };

  const handlePricingTypeChange = (e) => {
    setVenueFormData({
      ...venueFormData,
      pricingType: e.target.value
    });
  };

  const handleLocationChange = (location) => {
    // This function will be used when the map component is integrated
    setVenueFormData({
      ...venueFormData,
      location
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Create new FileList with existing and new files
    const newImages = [...venueFormData.images, ...files];
    
    // Create preview URLs for the images
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    
    setVenueFormData({
      ...venueFormData,
      images: newImages
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
      images: newImages
    });
    
    setImagePreviewUrls(newImageUrls);
  };

  const handleRuleChange = (e) => {
    const { name, checked } = e.target;
    setVenueFormData({
      ...venueFormData,
      rules: {
        ...venueFormData.rules,
        [name]: checked
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    
    // Check required fields
    if (!venueFormData.name.trim()) {
      errors.name = 'Venue name is required';
    }
    
    if (venueFormData.images.length === 0) {
      errors.images = 'At least one image is required';
    }
    
    if (!venueFormData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!venueFormData.category) {
      errors.category = 'Category is required';
    }
    
    if (!venueFormData.available_dates.trim()) {
      errors.available_dates = 'Available dates information is required';
    }
    
    if (!venueFormData.contact_email.trim()) {
      errors.contact_email = 'Contact email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(venueFormData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address';
    }
    
    // Check pricing fields
    if (venueFormData.pricingType === 'hourly' && !venueFormData.hourlyRate) {
      errors.hourlyRate = 'Hourly rate is required';
    }
    
    if (venueFormData.pricingType === 'daily' && !venueFormData.dailyRate) {
      errors.dailyRate = 'Daily rate is required';
    }
    
    if (venueFormData.capacity === '>5000' && !venueFormData.exactCapacity) {
      errors.exactCapacity = 'Please specify an approximate capacity';
    }
    
    // Update validation errors
    setValidationErrors(errors);
    
    // If there are errors, don't submit the form
    if (Object.keys(errors).length > 0) {
      // Scroll to the first error
      const firstErrorElement = document.querySelector(`.${styles.errorText}`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Reset messages
    setSubmitError('');
    setSubmitSuccess('');
    
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Submit venue data to the server
      const response = await addVenue(venueFormData);
      
      if (response.success) {
        // Show success message
        setSubmitSuccess('Venue added successfully!');
        
        // Reset form data
        setVenueFormData({
          name: '',
          capacity: '<100',
          exactCapacity: '',
          amenities: {
            parking: false,
            wifi: false,
            airConditioning: false,
            security: false,
            catering: false,
            audioVisual: false,
            outdoorSpace: false,
            accessibleEntrance: false
          },
          gates: 1,
          location: { lat: 30.0444, lng: 31.2357 },
          pricingType: 'hourly',
          hourlyRate: '',
          dailyRate: '',
          images: [],
          description: '',
          available_dates: '',
          category: '',
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
            capacityLimit: false
          },
          otherRules: '',
          contact_email: ''
        });
        setImagePreviewUrls([]);
        setValidationErrors({});
        
        // Fetch updated venues
        const venuesResponse = await getMyVenues();
        if (venuesResponse.success && venuesResponse.data && venuesResponse.data.venues) {
          setUserVenues(venuesResponse.data.venues);
        }
        
        // Close the modal after a delay to show the success message
        setTimeout(() => {
          toggleAddVenueModal();
          setSubmitSuccess('');
        }, 2000);
      } else {
        // Show error message
        setSubmitError(response.error || 'Failed to add venue. Please try again.');
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Use the DashboardHeader component with transparent background */}
      <DashboardHeader 
        handleLogout={handleLogout} 
        toggleNotifications={toggleNotifications} 
        showNotifications={showNotifications} 
        newNotificationsCount={newNotificationsCount} 
        notifications={mockData.notifications}
      />

      {/* Main Dashboard Content */}
      <main className={styles.mainContent}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Dashboard</h1>
            <p className={styles.welcomeText}>Welcome back to your venue management overview</p>
          </div>
          <button className={styles.newVenueButton} onClick={toggleAddVenueModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add New Venue
          </button>
        </div>
        
        {/* Top Dashboard Cards */}
        <div className={styles.cardsGrid}>
          {/* Total Earnings Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Total Earnings
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>${mockData.earnings.total.toLocaleString()}</span>
                <span className={`${styles.percentChange} ${mockData.earnings.isPositive ? styles.percentPositive : styles.percentNegative}`}>
                  +{mockData.earnings.percentChange}%
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Bookings Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Upcoming Bookings
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>{mockData.bookings.upcoming}</span>
                <span className={styles.percentChange}>+0%</span>
              </div>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Pending Requests
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>{mockData.bookings.pending}</span>
                <span className={styles.percentChange}>+0%</span>
              </div>
            </div>
          </div>

          {/* Venues Listed Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 22H22M2 11H22M2 7H22M11 3H13M10 22V17.5C10 16.6716 10.6716 16 11.5 16H12.5C13.3284 16 14 16.6716 14 17.5V22M4 11V22M20 11V22M15 7C15 8.10457 14.1046 9 13 9H11C9.89543 9 9 8.10457 9 7V3H15V7Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </span>
                Venues Listed
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>{userVenues.length || 0}</span>
                <span className={styles.percentChange}>+0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Action button cards */}
        <div className={styles.actionsList}>
          <button className={styles.actionButton}>
            <span className={`${styles.actionIconContainer} ${styles.earningsIcon}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className={styles.actionText}>View Summary</span>
          </button>
          
          <button className={styles.actionButton}>
            <span className={`${styles.actionIconContainer} ${styles.listingsIcon}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17H15M9 13H15M9 9H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className={styles.actionText}>Manage Listings</span>
          </button>
          
          <button className={styles.actionButton}>
            <span className={`${styles.actionIconContainer} ${styles.reportsIcon}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V15.01M12 12C12.01 11.9996 12.0199 11.9996 12.0299 12C12.0399 12.0005 12.0499 12.0005 12.0599 12C12.0699 11.9994 12.0799 11.9994 12.0899 12C12.0999 12.0006 12.1099 12.0006 12.12 12M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              <button className={styles.viewAllSectionButton}>
                View All
              </button>
            </div>
            
            <table className={styles.bookingsTable}>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Venue</th>
                  <th>Client</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockData.upcomingBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>
                      <h4 className={styles.bookingTitle}>{booking.eventTitle}</h4>
                    </td>
                    <td>
                      <p className={styles.bookingClient}>{booking.dateTime} • {booking.venue}</p>
                    </td>
                    <td>
                      <p className={styles.bookingClient}>{booking.clientName}</p>
                    </td>
                    <td>
                      <span className={`${styles.bookingStatus} ${booking.status === 'Confirmed' ? styles.statusConfirmed : styles.statusPending}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Venues Section */}
        <div className={styles.sectionsGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Venues</h2>
              <button className={styles.viewAllSectionButton} onClick={toggleAddVenueModal}>
                Add New Venue
              </button>
            </div>
            
            {userVenues.length > 0 ? (
              <div className={styles.venueGrid}>
                {userVenues.map(venue => (
                  <div key={venue.venue_ID} className={styles.venueCard}>
                    <div className={styles.venueImageContainer}>
                      <img 
                        src={venue.images ? (venue.images.includes(',') ? venue.images.split(',')[0] : venue.images) : '/placeholder-venue.jpg'} 
                        alt={venue.name} 
                        className={styles.venueImage} 
                      />
                    </div>
                    <div className={styles.venueInfo}>
                      <h3 className={styles.venueName}>{venue.name}</h3>
                      <p className={styles.venueCategory}>{venue.category}</p>
                      <div className={styles.venueDetailsRow}>
                        <span className={styles.venueCapacity}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          Capacity: {venue.capacity}
                        </span>
                        <span className={styles.venuePrice}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15V15.01M12 12C12.01 11.9996 12.0199 11.9996 12.0299 12C12.0399 12.0005 12.0499 12.0005 12.0599 12C12.0699 11.9994 12.0799 11.9994 12.0899 12C12.0999 12.0006 12.1099 12.0006 12.12 12M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9ZM3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          {venue.pricing_type === 'hourly' ? `${venue.cost_hourly} EGP/hr` : `${venue.cost_daily} EGP/day`}
                        </span>
                      </div>
                      <div className={styles.venueActions}>
                        <button className={styles.viewVenueButton}>View Details</button>
                        <button className={styles.editVenueButton}>Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noVenuesMessage}>
                <p>You haven&apos;t added any venues yet. Click the &quot;Add New Venue&quot; button to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Venue Modal */}
      {showAddVenueModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Venue</h2>
              <button className={styles.closeModalButton} onClick={toggleAddVenueModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <p className={styles.sectionDescription}>Add at least one image of your venue</p>
                
                <div className={styles.imageUploadContainer}>
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className={styles.imagePreviewContainer}>
                      <img src={url} alt={`Venue preview ${index + 1}`} className={styles.imagePreview} />
                      <button 
                        type="button" 
                        className={styles.removeImageButton}
                        onClick={() => removeImage(index)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className={styles.addImageButton}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Image
                  </button>
                  
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                  />
                </div>
                
                {(venueFormData.images.length === 0 || validationErrors.images) && (
                  <p className={`${styles.imageRequiredText} ${validationErrors.images ? styles.errorText : ''}`}>
                    * At least one image is required
                  </p>
                )}
              </div>
              
              {/* Basic Information */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Basic Information</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="venueName" className={styles.formLabel}>Venue Name</label>
                  <input
                    type="text"
                    id="venueName"
                    name="name"
                    className={`${styles.formInput} ${validationErrors.name ? styles.inputError : ''}`}
                    value={venueFormData.name}
                    onChange={handleInputChange}
                    required
                  />
                  {validationErrors.name && <p className={styles.errorText}>{validationErrors.name}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="capacity" className={styles.formLabel}>Capacity</label>
                  <select
                    id="capacity"
                    name="capacity"
                    className={styles.formInput}
                    value={venueFormData.capacity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select capacity range</option>
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
                    <label htmlFor="exactCapacity" className={styles.formLabel}>Approximate Capacity</label>
                    <input
                      type="number"
                      id="exactCapacity"
                      name="exactCapacity"
                      className={`${styles.formInput} ${validationErrors.exactCapacity ? styles.inputError : ''}`}
                      value={venueFormData.exactCapacity}
                      onChange={handleInputChange}
                      placeholder="Enter an approximate number"
                      required={venueFormData.capacity === ">5000"}
                      min="5001"
                    />
                    {validationErrors.exactCapacity && <p className={styles.errorText}>{validationErrors.exactCapacity}</p>}
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label htmlFor="gates" className={styles.formLabel}>Number of Gates/Entrances</label>
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
                <p className={styles.sectionDescription}>Select all amenities that your venue offers</p>
                
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
                    <label htmlFor="accessibleEntrance">Accessible Entrance</label>
                  </div>
                </div>
              </div>
              
              {/* Description Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Venue Description</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.formLabel}>Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className={`${styles.formInput} ${styles.textarea} ${validationErrors.description ? styles.inputError : ''}`}
                    value={venueFormData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your venue, its unique features, and what makes it special"
                    rows={4}
                    required
                  ></textarea>
                  {validationErrors.description && <p className={styles.errorText}>{validationErrors.description}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="category" className={styles.formLabel}>Venue Category</label>
                  <select
                    id="category"
                    name="category"
                    className={`${styles.formInput} ${validationErrors.category ? styles.inputError : ''}`}
                    value={venueFormData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select venue category</option>
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
                  {validationErrors.category && <p className={styles.errorText}>{validationErrors.category}</p>}
                </div>
              </div>
              
              {/* Available Dates Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Availability</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="available_dates" className={styles.formLabel}>Available Dates</label>
                  <textarea
                    id="available_dates"
                    name="available_dates"
                    className={`${styles.formInput} ${styles.textarea} ${validationErrors.available_dates ? styles.inputError : ''}`}
                    value={venueFormData.available_dates}
                    onChange={handleInputChange}
                    placeholder="Specify your venue&apos;s availability (e.g., &apos;Available all weekdays from 9AM-5PM, weekends upon request&apos;)"
                    rows={3}
                    required
                  ></textarea>
                  {validationErrors.available_dates && <p className={styles.errorText}>{validationErrors.available_dates}</p>}
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
                  <label htmlFor="otherRules" className={styles.formLabel}>Other Rules (Optional)</label>
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
                  <label htmlFor="contact_email" className={styles.formLabel}>Contact Email</label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    className={`${styles.formInput} ${validationErrors.contact_email ? styles.inputError : ''}`}
                    value={venueFormData.contact_email}
                    onChange={handleInputChange}
                    placeholder="Enter email address for booking inquiries"
                    required
                  />
                  {validationErrors.contact_email && <p className={styles.errorText}>{validationErrors.contact_email}</p>}
                </div>
              </div>
              
              {/* Location Section */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Location</h3>
                <p className={styles.sectionDescription}>Select your venue&apos;s location on the map</p>
                
                <div className={styles.mapContainer}>
                  <MapContainer 
                    center={[parseFloat(venueFormData.location.lat), parseFloat(venueFormData.location.lng)]} 
                    zoom={13} 
                    style={{ height: '300px', width: '100%' }}
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Selected Location:
                </div>
                <div className={styles.mapCoordinates}>
                  Latitude: {venueFormData.location.lat}, Longitude: {venueFormData.location.lng}
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
                      checked={venueFormData.pricingType === 'hourly'}
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
                      checked={venueFormData.pricingType === 'daily'}
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
                      checked={venueFormData.pricingType === 'both'}
                      onChange={handlePricingTypeChange}
                    />
                    <label htmlFor="both">Both Options</label>
                  </div>
                </div>
                
                {(venueFormData.pricingType === 'hourly' || venueFormData.pricingType === 'both') && (
                  <div className={styles.formGroup}>
                    <label htmlFor="hourlyRate" className={styles.formLabel}>Hourly Rate (EGP)</label>
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      className={`${styles.formInput} ${validationErrors.hourlyRate ? styles.inputError : ''}`}
                      value={venueFormData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="Enter hourly rate in EGP"
                      min="0"
                      step="0.01"
                      required={venueFormData.pricingType === 'hourly'}
                    />
                    {validationErrors.hourlyRate && <p className={styles.errorText}>{validationErrors.hourlyRate}</p>}
                  </div>
                )}
                
                {(venueFormData.pricingType === 'daily' || venueFormData.pricingType === 'both') && (
                  <div className={styles.formGroup}>
                    <label htmlFor="dailyRate" className={styles.formLabel}>Daily Rate (EGP)</label>
                    <input
                      type="number"
                      id="dailyRate"
                      name="dailyRate"
                      className={`${styles.formInput} ${validationErrors.dailyRate ? styles.inputError : ''}`}
                      value={venueFormData.dailyRate}
                      onChange={handleInputChange}
                      placeholder="Enter daily rate in EGP"
                      min="0"
                      step="0.01"
                      required={venueFormData.pricingType === 'daily'}
                    />
                    {validationErrors.dailyRate && <p className={styles.errorText}>{validationErrors.dailyRate}</p>}
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
                  {isSubmitting ? 'Adding Venue...' : 'Add Venue'}
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