import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/notificationService';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await getUserNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications.map(notification => ({
          id: notification.notification_ID,
          message: notification.message,
          time: new Date(notification.created_at),
          isRead: notification.is_read,
          type: notification.notification_type,
          relatedId: notification.related_ID
        })));
        setUnreadCount(response.data.unreadCount);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      /* log removed */
      setError('An error occurred while fetching notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      /* log removed */
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      /* log removed */
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    
    // Format date
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    return `${notificationTime.toLocaleDateString(undefined, dateOptions)} at ${notificationTime.toLocaleTimeString(undefined, timeOptions)}`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💰';
      case 'message':
        return '✉️';
      case 'system':
        return '🔔';
      default:
        return '🔔';
    }
  };

  return (
    <div className={styles.notificationsPage}>
      <DashboardHeader />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <button 
              className={styles.markAllReadBtn}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchNotifications} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>🔔</div>
            <h2>No notifications yet</h2>
            <p>When you receive notifications, they will appear here.</p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className={styles.notificationContent}>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <span className={styles.notificationTime}>
                    {formatNotificationTime(notification.time)}
                  </span>
                </div>
                {!notification.isRead && <div className={styles.unreadIndicator}></div>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Notifications;
