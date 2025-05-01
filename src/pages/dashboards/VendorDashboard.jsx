import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../utils/authService';

function VendorDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Vendor Dashboard</h1>
      <p>Welcome to your vendor dashboard. Here you can manage your products and services.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Your Products</h2>
        <p>You haven&apos;t added any products or services yet.</p>
        
        <button 
          style={{
            marginTop: '10px',
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add New Product
        </button>
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

export default VendorDashboard;