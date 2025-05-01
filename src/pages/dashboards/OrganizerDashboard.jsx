import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../utils/authService';
import { getAvailableVenues } from '../../utils/venueService';
import DashboardHeader from '../../components/DashboardHeader';
import styles from './VenueDashboard.module.css'; 
import VenueOwnerModal from "../../components/modals/VenueOwnerModal";

// Mock data for the dashboard
const mockData = {
  earnings: {
    total: 8750,
    percentChange: 8.3,
    isPositive: true
  },
  events: {
    upcoming: 3,
    total: 5
  },
  bookings: {
    total: 67,
    pendingCount: 12
  },
  vendorRequests: {
    pending: 8
  },
  upcomingEvents: [
    {
      id: 1,
      eventTitle: 'Tech Conference 2025',
      venue: 'Digital Hub Conference Center',
      dateTime: '2025-05-15 at 09:00',
      capacity: 350,
      ticketsSold: 245,
      status: 'Upcoming'
    },
    {
      id: 2,
      eventTitle: 'Summer Music Festival',
      venue: 'Riverside Gardens',
      dateTime: '2025-06-10 at 16:00',
      capacity: 1200,
      ticketsSold: 780,
      status: 'Upcoming'
    },
    {
      id: 3,
      eventTitle: 'Entrepreneurship Workshop',
      venue: 'Business Innovation Center',
      dateTime: '2025-04-28 at 10:00',
      capacity: 80,
      ticketsSold: 76,
      status: 'Upcoming'
    }
  ],
  vendorRequestsList: [
    {
      id: 1,
      vendorName: 'Gourmet Catering Services',
      eventId: 1,
      eventName: 'Tech Conference 2025',
      services: ['Food & Beverage', 'Staff'],
      requestDate: '2025-03-20',
      status: 'Pending'
    },
    {
      id: 2,
      vendorName: 'Sound Masters',
      eventId: 2,
      eventName: 'Summer Music Festival',
      services: ['Audio Equipment', 'Technicians'],
      requestDate: '2025-03-22',
      status: 'Pending'
    },
    {
      id: 3,
      vendorName: 'Decor Experts',
      eventId: 1,
      eventName: 'Tech Conference 2025',
      services: ['Stage Setup', 'Decorations'],
      requestDate: '2025-03-18',
      status: 'Pending'
    }
  ],
  notifications: [
    {
      id: 1,
      message: 'New vendor application for Tech Conference',
      time: '10m ago',
      isNew: true
    },
    {
      id: 2,
      message: '25 new tickets sold for Summer Music Festival',
      time: '1h ago',
      isNew: true
    },
    {
      id: 3,
      message: 'Vendor Sound Masters confirmed for Music Festival',
      time: '3h ago',
      isNew: false
    },
    {
      id: 4,
      message: 'Payment confirmation for venue reservation',
      time: '5h ago',
      isNew: false
    }
  ]
};

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showReserveVenueModal, setShowReserveVenueModal] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [availableVenues, setAvailableVenues] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    eventName: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    attendees: '',
    selectedPricingOption: 'hourly'
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  const newNotificationsCount = mockData.notifications.filter(n => n.isNew).length;

  // Fetch user's events when component mounts
  useEffect(() => {
    setUserEvents(mockData.upcomingEvents);
  }, []);

  // Fetch available venues
  useEffect(() => {
    const fetchAvailableVenues = async () => {
      setIsLoadingVenues(true);
      setVenueError(null);
      
      try {
        const response = await getAvailableVenues();
        console.log('Raw API response:', response);
        
        if (response.success && response.data && response.data.venues) {
          // Raw response inspection - super detailed
          console.log('----- DETAILED API RESPONSE INSPECTION -----');
          console.log('Full API response data:', JSON.stringify(response.data, null, 2));
          console.log('Original venues array:', JSON.stringify(response.data.venues, null, 2));
          
          // Check if the venue data is being modified during processing
          const processedVenues = response.data.venues.map(venue => {
            console.log(`Processing venue with ID ${venue.id}:`, venue);
            // Return venue unchanged for this logging
            return venue;
          });
          
          // Detailed logging of each venue
          console.log('Venues data structure:');
          processedVenues.forEach((venue, index) => {
            console.log(`Venue ${index + 1}:`, {
              id: venue.id,
              name: venue.name,
              userID: venue.userID,
              ownerName: venue.ownerName
            });
          });
          
          setAvailableVenues(response.data.venues);
        } else {
          setVenueError(response.error || 'Failed to fetch available venues');
        }
      } catch (error) {
        console.error('Error fetching available venues:', error);
        setVenueError('An unexpected error occurred while fetching venues');
      } finally {
        setIsLoadingVenues(false);
      }
    };
    
    fetchAvailableVenues();
  }, []);

  // Add debug effect
  useEffect(() => {
    if (selectedOwner) {
      console.log("Modal should open for owner ID:", selectedOwner);
    }
  }, [selectedOwner]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleCreateEventModal = () => {
    setShowCreateEventModal(!showCreateEventModal);
  };
  
  const toggleReserveVenueModal = () => {
    setShowReserveVenueModal(!showReserveVenueModal);
  };
  
  const handleApproveVendor = (vendorId) => {
    // Mock function to approve vendor - would be replaced with actual API call
    console.log(`Approving vendor with ID: ${vendorId}`);
    // Update UI after approval
  };
  
  const handleDeclineVendor = (vendorId) => {
    // Mock function to decline vendor - would be replaced with actual API call
    console.log(`Declining vendor with ID: ${vendorId}`);
    // Update UI after declining
  };
  
  // Find a venue by ID, trying different possible ID field names
  const findVenueById = (venueId) => {
    console.log('Finding venue with ID:', venueId);
    console.log('Venue types in availableVenues:', availableVenues.map(v => ({
      id: v.id, 
      venue_ID: v.venue_ID,
      idType: typeof(v.id), 
      venue_IDType: typeof(v.venue_ID)
    })));
    
    // Try multiple ID fields and handle both string and number comparisons
    return availableVenues.find(v => {
      // Some venues might use id, others venue_ID, handle both cases
      if (v.id !== undefined && (String(v.id) === String(venueId))) {
        return true;
      }
      if (v.venue_ID !== undefined && (String(v.venue_ID) === String(venueId))) {
        return true;
      }
      return false;
    });
  };
  
  const handleReserveVenue = (venueId) => {
    // Find the venue using our helper function that checks multiple ID fields
    const venue = findVenueById(venueId);
    
    if (venue) {
      console.log('Selected venue for reservation:', venue);
      
      // Reset event details and calculated price when selecting a new venue
      setEventDetails({
        eventName: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        attendees: '',
        selectedPricingOption: venue.pricing_type === 'daily' ? 'daily' : 'hourly'
      });
      
      // Set initial calculated price based on default pricing option
      if (venue.pricing_type === 'daily') {
        setCalculatedPrice(parseFloat(venue.cost_daily) || 0);
      } else {
        setCalculatedPrice(parseFloat(venue.cost_hourly) || 0);
      }
      
      // Important: Make a new copy of the venue object to ensure React detects state change
      setSelectedVenue({...venue});
      setSelectedVenueId(venueId);
      setShowReserveVenueModal(true);
    } else {
      console.error(`Venue with ID ${venueId} not found in available venues`);
    }
  };
  
  // Handle event details changes and recalculate price
  const handleEventDetailsChange = (e) => {
    const { name, value } = e.target;
    
    setEventDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Recalculate price after form fields change
    calculatePrice({
      ...eventDetails,
      [name]: value
    });
  };
  
  // Handle pricing option change (hourly or daily)
  const handlePricingOptionChange = (option) => {
    setEventDetails(prev => ({
      ...prev,
      selectedPricingOption: option
    }));
    
    // Recalculate price with new pricing option
    calculatePrice({
      ...eventDetails,
      selectedPricingOption: option
    });
  };
  
  // Calculate price based on event details and selected pricing option
  const calculatePrice = (details) => {
    if (!selectedVenue) return;
    
    try {
      if (details.selectedPricingOption === 'daily') {
        // Daily pricing is simple - just the daily rate
        setCalculatedPrice(parseFloat(selectedVenue.cost_daily) || 0);
      } else {
        // Hourly pricing - calculate based on start and end times
        if (details.startTime && details.endTime && details.eventDate) {
          const startDateTime = new Date(`${details.eventDate}T${details.startTime}`);
          const endDateTime = new Date(`${details.eventDate}T${details.endTime}`);
          
          // Calculate hours difference
          if (endDateTime > startDateTime) {
            const hoursDiff = (endDateTime - startDateTime) / (1000 * 60 * 60);
            const hourlyRate = parseFloat(selectedVenue.cost_hourly) || 0;
            const totalCost = hourlyRate * hoursDiff;
            setCalculatedPrice(totalCost);
          } else {
            // End time is before start time
            setCalculatedPrice(0);
          }
        } else {
          // Not enough data to calculate hourly price
          setCalculatedPrice(parseFloat(selectedVenue.cost_hourly) || 0);
        }
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      setCalculatedPrice(0);
    }
  };
  
  // Reset modal when closing
  const closeReserveVenueModal = () => {
    setShowReserveVenueModal(false);
    // Clear venue selection with a small delay to avoid state update conflicts
    setTimeout(() => {
      setSelectedVenue(null);
      setSelectedVenueId(null);
    }, 100);
  };
  
  // Handle proceed to payment
  const handleProceedToPayment = () => {
    // This would typically redirect to a payment gateway
    alert(`Redirecting to payment gateway for ${calculatedPrice.toFixed(2)} EGP...`);
    // For now, we'll just close the modal
    closeReserveVenueModal();
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Use the DashboardHeader component with notifications */}
      <DashboardHeader 
        handleLogout={handleLogout} 
        toggleNotifications={() => console.log('Toggle notifications')} 
        showNotifications={false} 
        newNotificationsCount={newNotificationsCount} 
        notifications={mockData.notifications}
      />

      {/* Main Dashboard Content */}
      <main className={styles.mainContent}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Organizer Dashboard</h1>
            <p className={styles.welcomeText}>Welcome back to your event management hub</p>
          </div>
          <button className={styles.newVenueButton} onClick={toggleCreateEventModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Total Revenue
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>${mockData.earnings.total.toLocaleString()}</span>
                <span className={`${styles.percentChange} ${mockData.earnings.isPositive ? styles.percentPositive : styles.percentNegative}`}>
                  +{mockData.earnings.percentChange}%
                </span>
              </div>
            </div>
          </div>

          {/* Events Count Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                My Events
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>{mockData.events.total}</span>
                <span className={styles.cardSubValue}>{mockData.events.upcoming} upcoming</span>
              </div>
            </div>
          </div>

          {/* Ticket Sales Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Ticket Sales
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>{mockData.bookings.total}</span>
                <span className={styles.cardSubValue}>{mockData.bookings.pendingCount} pending</span>
              </div>
            </div>
          </div>

          {/* Vendor Requests Card */}
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIconInline}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 5H4V21L8 17H20V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Vendor Requests
              </h3>
              <div className={styles.cardValueContainer}>
                <span className={styles.cardValue}>{mockData.vendorRequests.pending}</span>
                <span className={styles.percentChange}>Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Action button cards */}
        <div className={styles.actionsList}>
          <button className={styles.actionButton} onClick={toggleCreateEventModal}>
            <span className={`${styles.actionIconContainer} ${styles.earningsIcon}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21M3 18H21M5 18V12M19 18V12M9 18V12M15 18V12M3 12H21M7 12V6H17V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className={styles.actionText}>Reserve Venue</span>
          </button>
          
          <button className={styles.actionButton} onClick={toggleCreateEventModal}>
            <span className={`${styles.actionIconContainer} ${styles.listingsIcon}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17H15M9 13H15M9 9H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className={styles.actionText}>Create Event</span>
          </button>
          
          <button className={styles.actionButton} onClick={() => toggleReserveVenueModal()}>
            <span className={`${styles.actionIconContainer} ${styles.reportsIcon}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5H4V21L8 17H20V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              <button className={styles.viewAllSectionButton} onClick={toggleCreateEventModal}>
                Create New Event
              </button>
            </div>
            
            {userEvents.length > 0 ? (
              <table className={styles.bookingsTable}>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date & Venue</th>
                    <th>Capacity</th>
                    <th>Tickets Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.upcomingEvents.map((event, index) => (
                    <tr key={index}>
                      <td>
                        <h4 className={styles.bookingTitle}>{event.eventTitle}</h4>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>{event.dateTime} • {event.venue}</p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>{event.capacity}</p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>{event.ticketsSold}</p>
                      </td>
                      <td>
                        <span className={`${styles.bookingStatus} ${styles.statusConfirmed}`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.noVenuesMessage}>
                <p>You haven&apos;t created any events yet. Click the &quot;Create New Event&quot; button to get started.</p>
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
                        src={Array.isArray(venue.images) && venue.images.length > 0 
                          ? venue.images[0] 
                          : (venue.images && typeof venue.images === 'string' 
                              ? `http://localhost:3008/uploads/venues/images-${venue.images.split(',')[0]}` 
                              : "https://via.placeholder.com/300x200")}
                        alt={venue.name} 
                        className={styles.venueImage}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200";
                        }}
                      />
                    </div>
                    <div className={styles.venueInfo}>
                      <h3 className={styles.venueName}>{venue.name}</h3>
                      <p className={styles.venueCategory}>{venue.category || 'Venue'}</p>
                      <p className={styles.venueOwner}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        Owner: {" "}
                        <button 
                          className={styles.ownerNameLink}
                          onClick={() => {
                            console.log("Full venue object:", venue);
                            
                            if (venue.venue_owner_ID) {
                              console.log("Using venue_owner_ID directly:", venue.venue_owner_ID);
                              
                              // Simply set the selected owner ID and let the modal component
                              // handle the API call with proper authentication
                              setSelectedOwner(venue.venue_owner_ID);
                            } else {
                              console.error("No venue_owner_ID available for this venue:", venue);
                              alert("Could not find venue owner information");
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: '#3a7bd5',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {venue.ownerName ? venue.ownerName.replace('TRACEMARKER__', '').replace('__ENDMARKER', '') : "Unknown Owner"}
                        </button>
                      </p>
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
                            <path d="M12 4V20M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {venue.pricing_type === 'both' 
                            ? `${venue.cost_hourly} EGP/hr • ${venue.cost_daily} EGP/day` 
                            : venue.pricing_type === 'hourly'
                              ? `${venue.cost_hourly} EGP/hr`
                              : `${venue.cost_daily} EGP/day`}
                        </span>
                      </div>
                      <div className={styles.venueActions}>
                        <button className={styles.viewVenueButton}>View Details</button>
                        <button 
                          className={styles.reserveVenueButton} 
                          onClick={() => {
                            console.log("Full venue object:", venue);
                            // Ensure we're using the correct ID field (from the console output we can see it's 'id')
                            const venueId = venue.id || venue.venue_ID;
                            console.log("Using venue ID:", venueId);
                            
                            if (venueId) {
                              // Reset modal state before opening new one
                              setSelectedVenue(null);
                              setTimeout(() => {
                                handleReserveVenue(venueId);
                              }, 10);
                            } else {
                              console.error("No venue ID available for this venue:", venue);
                              alert("Could not reserve venue: No venue ID found");
                            }
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
                <p>No available venues found at the moment. Please check back later.</p>
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
                        <h4 className={styles.bookingTitle}>{request.vendorName}</h4>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>{request.eventName}</p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>{request.services.join(', ')}</p>
                      </td>
                      <td>
                        <p className={styles.bookingClient}>{request.requestDate}</p>
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

      {/* Create Event Modal - replace this with your actual implementation */}
      {showCreateEventModal && (
        // Your existing create event modal implementation
        <div>Create Event Modal Placeholder</div>
      )}
      
      {/* Reserve Venue Modal */}
      {showReserveVenueModal && selectedVenue && (
        <div className={styles.modalOverlay} onClick={() => closeReserveVenueModal()}>
          <div className={styles.reserveVenueModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reserve Venue</h2>
              <button className={styles.closeModalButton} onClick={() => closeReserveVenueModal()}>
                &times;
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.reservationDetails}>
                <div className={styles.venueDetails}>
                  <h3>Venue Details</h3>
                  
                  <div className={styles.venueImagePreview}>
                    <img 
                      src={Array.isArray(selectedVenue.images) && selectedVenue.images.length > 0 
                        ? selectedVenue.images[0] 
                        : (selectedVenue.images && typeof selectedVenue.images === 'string' 
                            ? `http://localhost:3008/uploads/venues/images-${selectedVenue.images.split(',')[0]}` 
                            : "https://via.placeholder.com/300x200")}
                      alt={selectedVenue.name} 
                      className={styles.venueModalImage}
                      onError={(e) => {
                        console.log("Image load error, using placeholder");
                        e.target.src = "https://via.placeholder.com/300x200";
                      }}
                    />
                  </div>
                  
                  <div className={styles.venueInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Name:</span>
                      <span className={styles.infoValue}>{selectedVenue.name || 'Unnamed venue'}</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Location:</span>
                      <span className={styles.infoValue}>
                        {(() => {
                          try {
                            // Try parsing location if it's a string
                            if (typeof selectedVenue.location === 'string') {
                              const parsedLocation = JSON.parse(selectedVenue.location);
                              return parsedLocation.address || 'No address available';
                            }
                            // If it's already an object
                            return selectedVenue.location?.address || 'No address available';
                          } catch (error) {
                            console.error("Error parsing location:", error);
                            return 'Location unavailable';
                          }
                        })()}
                      </span>
                    </div>
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Capacity:</span>
                      <span className={styles.infoValue}>{selectedVenue.capacity || 0} people</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Category:</span>
                      <span className={styles.infoValue}>{selectedVenue.category || 'General'}</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Owner:</span>
                      <span className={styles.infoValue}>
                        {(() => {
                          const ownerName = selectedVenue.ownerName || selectedVenue.owner_name;
                          if (typeof ownerName === 'string') {
                            // Clean up any special markers that might be in the data
                            return ownerName
                              .replace('TRACEMARKER__', '')
                              .replace('__ENDMARKER', '') || 'Unknown';
                          }
                          return 'Unknown';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.eventDetailsForm}>
                  <h3>Event Details</h3>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="eventName">Event Name</label>
                    <input 
                      type="text" 
                      id="eventName" 
                      name="eventName"
                      placeholder="Enter event name"
                      className={styles.formInput}
                      value={eventDetails.eventName}
                      onChange={handleEventDetailsChange}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="eventDate">Event Date</label>
                    <input 
                      type="date" 
                      id="eventDate" 
                      name="eventDate"
                      className={styles.formInput}
                      value={eventDetails.eventDate}
                      onChange={handleEventDetailsChange}
                    />
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
                    <label htmlFor="attendees">Expected Number of Attendees</label>
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
                    <small className={styles.helperText}>Max: {selectedVenue.capacity} people</small>
                  </div>
                </div>
                
                <div className={styles.pricingOptions}>
                  <h3>Pricing Options</h3>
                  
                  {/* Display pricing options based on venue pricing_type */}
                  {selectedVenue.pricing_type === 'hourly' && (
                    <div className={styles.pricingOption}>
                      <input 
                        type="radio" 
                        id="hourlyRate" 
                        name="pricingOption" 
                        defaultChecked 
                        onChange={() => handlePricingOptionChange('hourly')}
                      />
                      <label htmlFor="hourlyRate">
                        Hourly Rate: <strong>{selectedVenue.cost_hourly} EGP/hour</strong>
                      </label>
                    </div>
                  )}
                  
                  {selectedVenue.pricing_type === 'daily' && (
                    <div className={styles.pricingOption}>
                      <input 
                        type="radio" 
                        id="dailyRate" 
                        name="pricingOption" 
                        defaultChecked 
                        onChange={() => handlePricingOptionChange('daily')}
                      />
                      <label htmlFor="dailyRate">
                        Daily Rate: <strong>{selectedVenue.cost_daily} EGP/day</strong>
                      </label>
                    </div>
                  )}
                  
                  {selectedVenue.pricing_type === 'both' && (
                    <>
                      <div className={styles.pricingOption}>
                        <input 
                          type="radio" 
                          id="hourlyRate" 
                          name="pricingOption" 
                          defaultChecked 
                          onChange={() => handlePricingOptionChange('hourly')}
                        />
                        <label htmlFor="hourlyRate">
                          Hourly Rate: <strong>{selectedVenue.cost_hourly} EGP/hour</strong>
                        </label>
                      </div>
                      
                      <div className={styles.pricingOption}>
                        <input 
                          type="radio" 
                          id="dailyRate" 
                          name="pricingOption" 
                          onChange={() => handlePricingOptionChange('daily')}
                        />
                        <label htmlFor="dailyRate">
                          Daily Rate: <strong>{selectedVenue.cost_daily} EGP/day</strong>
                        </label>
                      </div>
                    </>
                  )}
                  
                  <div className={styles.estimatedCost}>
                    <span className={styles.estimatedCostLabel}>Estimated Cost:</span>
                    <span className={styles.estimatedCostValue}>
                      {calculatedPrice.toFixed(2)} EGP
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={() => closeReserveVenueModal()}
              >
                Cancel
              </button>
              <button 
                className={styles.proceedToPaymentButton} 
                onClick={handleProceedToPayment}
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
    </div>
  );
}

export default OrganizerDashboard;