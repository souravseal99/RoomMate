# Dashboard API Documentation

## Overview

The Dashboard API provides dynamic statistics for the user's dashboard, including household count, pending chores, and monthly expenses.

## Endpoint

### GET `/dashboard`

Returns aggregated statistics for the authenticated user's dashboard.

#### Authentication

Required: Yes (JWT Bearer Token)

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Response

**Success Response (200 OK)**

```json
{
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "households": {
      "label": "Active Households",
      "value": 2
    },
    "chores": {
      "label": "Pending Tasks",
      "value": 5
    },
    "expenses": {
      "label": "This Month",
      "value": 1234.56
    }
  }
}
```

**Error Response (401 Unauthorized)**

```json
{
  "message": "Unauthorized"
}
```

**Error Response (500 Internal Server Error)**

```json
{
  "message": "Unable to fetch dashboard stats"
}
```

## Data Fields

### households
- **label**: "Active Households"
- **value**: Number of households the user is a member of

### chores
- **label**: "Pending Tasks"
- **value**: Number of incomplete chores assigned to the user

### expenses
- **label**: "This Month"
- **value**: Total amount of expenses in the current month across all user's households (rounded to 2 decimal places)

## Usage Examples

### cURL

```bash
curl -X GET http://localhost:5000/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const getDashboardStats = async () => {
  try {
    const response = await axios.get('http://localhost:5000/dashboard', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};
```

### Frontend Integration (React)

```typescript
import { useEffect, useState } from 'react';
import api from '@/api/axios';

interface DashboardStats {
  households: { label: string; value: number };
  chores: { label: string; value: number };
  expenses: { label: string; value: number };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Active Households: {stats?.households.value}</div>
      <div>Pending Tasks: {stats?.chores.value}</div>
      <div>This Month: ${stats?.expenses.value}</div>
    </div>
  );
};
```

## Implementation Details

### Database Queries

1. **Household Count**: Counts records in `HouseholdMember` table for the user
2. **Pending Chores**: Counts records in `Chore` table where `assignedToId` matches user and `completed` is false
3. **Monthly Expenses**: Aggregates sum of `amount` from `Expense` table for current month in user's households

### Performance

All three queries are executed in parallel using `Promise.all()` for optimal performance.

### Date Range

The monthly expenses calculation uses the current month's start and end dates (inclusive) based on the server's timezone.

## Testing

To test the endpoint, ensure:

1. Server is running on port 5000
2. User is authenticated with a valid JWT token
3. User has at least one household membership

Example test flow:

```bash
# 1. Register/Login to get access token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 2. Use the returned access token to call dashboard endpoint
curl -X GET http://localhost:5000/dashboard \
  -H "Authorization: Bearer <access_token_from_step_1>"
```

## Notes

- All monetary values are rounded to 2 decimal places
- The endpoint requires a valid authentication token
- Statistics are user-specific and isolated by household membership
- Expense calculations only include expenses from the current calendar month
