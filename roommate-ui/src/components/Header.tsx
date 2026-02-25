import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #ddd',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          color: '#333',
          textDecoration: 'none'
        }}>
          RoomMate
        </Link>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <span style={{ color: '#666' }}>Welcome, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
