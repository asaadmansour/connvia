import React from 'react';
import styles from './AccountDetails.module.css';

// This is a reusable account details component
function AccountDetails() {
  // In a real app, fetch user info from context or API
  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'Venue Manager',
    phone: '+1 555-123-4567',
    joined: '2024-01-15'
  };

  return (
    <div className={styles.accountDetailsContainer}>
      <h2 className={styles.title}>Account Details</h2>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}><span>Name:</span> {user.name}</div>
        <div className={styles.infoItem}><span>Email:</span> {user.email}</div>
        <div className={styles.infoItem}><span>Role:</span> {user.role}</div>
        <div className={styles.infoItem}><span>Phone:</span> {user.phone}</div>
        <div className={styles.infoItem}><span>Joined:</span> {user.joined}</div>
      </div>
    </div>
  );
}

export default AccountDetails;
