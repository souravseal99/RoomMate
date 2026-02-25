import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHouseholdMembers, leaveHousehold, getHouseholds } from '../api/household';

interface Member {
  userId: string;
  householdId: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    name: string;
    email: string;
  };
}

interface Household {
  householdId: string;
  name: string;
}

export default function HouseholdMembers() {
  const { householdId } = useParams<{ householdId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [householdId]);

  const fetchData = async () => {
    if (!householdId) return;
    
    try {
      const [membersData, householdsData] = await Promise.all([
        getHouseholdMembers(householdId),
        getHouseholds(),
      ]);
      
      setMembers(membersData);
      
      const currentHousehold = householdsData.find((h: Household) => h.householdId === householdId);
      if (currentHousehold) {
        setHousehold(currentHousehold);
      }
      
      // Get current user ID from localStorage
      const userStr = localStorage.getItem('roommate_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // We need the userId - it's not in the stored user object
        // For now, we'll find the member that matches the user's email
        const currentMember = membersData.find((m: Member) => m.user.email === user.email);
        if (currentMember) {
          setCurrentUserId(currentMember.userId);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load household members');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!householdId) return;
    
    setIsLeaving(true);
    try {
      const response = await leaveHousehold(householdId);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to leave household');
      setShowConfirm(false);
    } finally {
      setIsLeaving(false);
    }
  };

  const currentMember = members.find(m => m.userId === currentUserId);
  const isCurrentUserAdmin = currentMember?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '16px' }}>
        &larr; Back to Dashboard
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>{household?.name || 'Household'} Members</h1>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

      {members.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p>No members found</p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{member.user.name}</td>
                  <td style={{ padding: '12px' }}>{member.user.email}</td>
                  <td style={{ padding: '12px' }}>
                    {member.role === 'ADMIN' ? (
                      <span style={{ 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        ADMIN
                      </span>
                    ) : (
                      <span style={{ 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        MEMBER
                      </span>
                    )}
                    {member.userId === currentUserId && (
                      <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>(You)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        {!showConfirm ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="btn btn-danger"
          >
            Leave Household
          </button>
        ) : (
          <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
            <p style={{ marginBottom: '16px' }}>
              {isCurrentUserAdmin && members.length > 1 ? (
                <strong>Warning:</strong>
              ) : null}
              {' '}Are you sure you want to leave this household?
              {isCurrentUserAdmin && members.length === 1 && (
                <strong> As the sole admin, the household will be deleted.</strong>
              )}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary"
                disabled={isLeaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleLeave}
                className="btn btn-danger"
                disabled={isLeaving}
              >
                {isLeaving ? 'Leaving...' : 'Confirm Leave'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
