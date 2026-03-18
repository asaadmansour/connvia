import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { logoutUser, getUserRole } from '../utils/authService';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/notificationService';
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
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  
  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(notificationInterval);
  }, []);
  
  // Function to fetch notifications from the API
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await getUserNotifications();
      if (response.success && response.data) {
        // Format notifications data
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification.notification_ID,
          message: notification.message,
          time: formatNotificationTime(notification.created_at),
          isNew: !notification.is_read,
          type: notification.notification_type,
          relatedId: notification.related_ID
        }));
        
        setNotifications(formattedNotifications);
        setNewNotificationsCount(response.data.unreadCount);
      }
    } catch (error) {
      /* log removed */
    } finally {
      setIsLoadingNotifications(false);
    }
  };
  
  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };
  
  // Handle notification click
  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state to reflect the change
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isNew: false } 
            : notification
        )
      );
      setNewNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      /* log removed */
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state to reflect all notifications as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isNew: false }))
      );
      setNewNotificationsCount(0);
    } catch (error) {
      /* log removed */
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // If opening notifications and there are unread ones, fetch latest
    if (!showNotifications && newNotificationsCount > 0) {
      fetchNotifications();
    }
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
                className={styles.notificationsDropdown}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className={styles.notificationsHeader}>
                  <h3>Notifications</h3>
                  <button 
                    className={styles.markAllRead}
                    onClick={handleMarkAllAsRead}
                    disabled={newNotificationsCount === 0}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className={styles.notificationsList}>
                  {isLoadingNotifications ? (
                    <div className={styles.loadingNotifications}>Loading notifications...</div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`${styles.notificationItem} ${notification.isNew ? styles.unread : ''}`}
                        variants={notificationVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className={styles.notificationContent}>
                          <p>{notification.message}</p>
                          <span className={styles.notificationTime}>{notification.time}</span>
                        </div>
                        {notification.isNew && <div className={styles.unreadDot}></div>}
                      </motion.div>
                    ))
                  ) : (
                    <div className={styles.emptyNotifications}>No notifications</div>
                  )}
                </div>
                <div className={styles.notificationsFooter}>
                  <Link to="/notifications" className={styles.viewAllLink}>View all notifications</Link>
                </div>
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
