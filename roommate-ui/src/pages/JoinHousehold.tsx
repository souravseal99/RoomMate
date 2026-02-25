import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { joinHousehold } from '../api/household';

export default function JoinHousehold() {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { inviteCode: urlInviteCode } = useParams<{ inviteCode?: string }>();

  useEffect(() => {
    if (urlInviteCode) {
      setInviteCode(urlInviteCode);
    }
  }, [urlInviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await joinHousehold(inviteCode.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to join household');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>Join Household</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="inviteCode">Invite Code</label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              placeholder="Enter 8-character code"
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Enter the 8-character code shared by a household member
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
