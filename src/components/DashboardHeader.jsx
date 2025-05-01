import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { logoutUser, getUserRole } from '../utils/authService';
import styles from './DashboardHeader.module.css';

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const notificationVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
};

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }
};

function DashboardHeader() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountDropdownRef = useRef(null);
  const userRole = getUserRole();

  // Mock notifications data
  const notifications = [
    { id: 1, message: 'New booking request for Cairo Garden', time: '5m ago', isNew: true },
    { id: 2, message: 'Booking for Tech Conference confirmed', time: '1h ago', isNew: true },
    { id: 3, message: 'Message from Event Creator Alex', time: '2h ago', isNew: false },
    { id: 4, message: 'Payment received for Wedding Booking', time: '3h ago', isNew: false }
  ];
  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleAccountDropdown = () => {
    setShowAccountDropdown((prev) => !prev);
  };

  // Handle scroll event for header background
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    }
    if (showAccountDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountDropdown]);

  // Get user role label for display
  const getRoleLabel = () => {
    switch(userRole) {
      case 'organizer': return 'Event Organizer';
      case 'vendor': return 'Vendor';
      case 'venue': return 'Venue Manager';
      case 'regular':
      default: return 'Attendee';
    }
  };

  return (
    <motion.header 
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <Logo color="#fff" />
          <span className={styles.roleTagDark}>{getRoleLabel()}</span>
        </div>
        
        <div className={styles.headerActions}>
          <nav className={styles.dashboardNav}>
            <Link to="/events" className={styles.navLink}>Events</Link>
            <Link to={`/dashboards/${userRole === 'regular' ? 'attendee' : userRole}`} className={styles.navLink}>Dashboard</Link>
          </nav>
          
          <div className={styles.notificationContainer}>
            <button 
              onClick={toggleNotifications}
              className={styles.notificationButton}
              aria-label="Notifications"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
              </svg>
              {newNotificationsCount > 0 && (
                <span className={styles.notificationBadge}>
                  {newNotificationsCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
            {showNotifications && (
              <motion.div 
                className={styles.notificationDropdown}
                variants={notificationVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <h3 className={styles.notificationTitle}>Notifications</h3>
                {notifications.length > 0 ? (
                  <>
                    <div className={styles.notificationList}>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`${styles.notificationItem} ${notification.isNew ? styles.notificationNew : ''}`}
                        >
                          <div className={styles.notificationContent}>
                            <span className={styles.notificationMessage}>{notification.message}</span>
                            <span className={styles.notificationTime}>{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className={styles.viewAllButton}>
                      View All Notifications
                    </button>
                  </>
                ) : (
                  <p className={styles.emptyNotifications}>No notifications yet</p>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
          
          <div className={styles.accountDropdownWrapper} ref={accountDropdownRef}>
            <button 
              onClick={toggleAccountDropdown}
              className={styles.accountButton}
              aria-label="Account"
            >
              <div className={styles.accountAvatar}>
                {userRole === 'venue' ? 'VM' : 
                 userRole === 'organizer' ? 'EO' :
                 userRole === 'vendor' ? 'VD' : 'AT'}
              </div>
              <span>Account</span>
              <svg style={{marginLeft: '0.3rem'}} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <AnimatePresence>
            {showAccountDropdown && (
              <motion.div 
                className={styles.accountDropdown}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <button className={styles.accountDropdownItem} onClick={()=>{ setShowAccountDropdown(false); navigate('/account'); }}>
                  Account Details
                </button>
                <button className={styles.accountDropdownItem} onClick={()=>{ setShowAccountDropdown(false); navigate('/help'); }}>
                  Help
                </button>
                <button className={styles.accountDropdownItem} onClick={handleLogout}>
                  Logout
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default DashboardHeader;
