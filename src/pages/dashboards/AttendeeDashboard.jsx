import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../utils/authService';

function AttendeeDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Attendee Dashboard</h1>
      <p>Welcome to your attendee dashboard. Here you can view and manage your event registrations.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Your Upcoming Events</h2>
        <p>You don&apos;t have any upcoming events yet.</p>
      </div>
      
      <button 
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '10px 15px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default AttendeeDashboard;