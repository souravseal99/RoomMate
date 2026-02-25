import { Link } from 'react-router-dom';

interface HouseholdCardProps {
  household: {
    householdId: string;
    name: string;
    inviteCode?: string;
    memberCount?: number;
  };
}

export default function HouseholdCard({ household }: HouseholdCardProps) {
  return (
    <Link
      to={`/household/${household.householdId}/members`}
      style={{ textDecoration: 'none' }}
    >
      <div 
        className="card" 
        style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <h3 style={{ marginBottom: '8px' }}>{household.name}</h3>
        
        {household.memberCount !== undefined && (
          <p style={{ color: '#666', fontSize: '14px' }}>
            {household.memberCount} {household.memberCount === 1 ? 'member' : 'members'}
          </p>
        )}
        
        {household.inviteCode && (
          <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
            Invite Code: <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>
              {household.inviteCode}
            </code>
          </p>
        )}
      </div>
    </Link>
  );
}
