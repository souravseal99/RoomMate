import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [households, setHouseholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {
      const sessionId = localStorage.getItem('roommate_session_id');
      const response = await fetch('/api/household/all', {
        headers: {
          'x-session-id': sessionId || '',
        },
      });
      const data = await response.json();
      if (data.data) {
        setHouseholds(data.data);
      }
    } catch (err) {
      setError('Failed to load households');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>My Households</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/household/create" className="btn btn-primary">
            Create Household
          </Link>
          <Link to="/household/join" className="btn btn-secondary">
            Join Household
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {households.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            You don't have any households yet.
          </p>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            Create a new household or join an existing one.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/household/create" className="btn btn-primary">
              Create Household
            </Link>
            <Link to="/household/join" className="btn btn-secondary">
              Join Household
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {households.map((household) => (
            <Link
              key={household.householdId}
              to={`/household/${household.householdId}/members`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ cursor: 'pointer' }}>
                <h3>{household.name}</h3>
                <p style={{ color: '#666', marginTop: '8px' }}>
                  {household.members?.length || 0} members
                </p>
                {household.inviteCode && (
                  <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    Invite Code: {household.inviteCode}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
