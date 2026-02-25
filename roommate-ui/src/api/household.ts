import axios from 'axios';

const API_BASE = '/api';

function getHeaders() {
  const sessionId = localStorage.getItem('roommate_session_id');
  return {
    'x-session-id': sessionId || '',
  };
}

interface Household {
  householdId: string;
  name: string;
  inviteCode?: string;
}

interface HouseholdMember {
  userId: string;
  householdId: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    name: string;
    email: string;
  };
}

export async function createHousehold(name: string): Promise<any> {
  const response = await axios.post(
    `${API_BASE}/household/create`,
    { name },
    { headers: getHeaders() }
  );
  return response.data;
}

export async function joinHousehold(inviteCode: string): Promise<any> {
  const response = await axios.post(
    `${API_BASE}/household/join/${inviteCode}`,
    {},
    { headers: getHeaders() }
  );
  return response.data;
}

export async function getHouseholds(): Promise<Household[]> {
  const response = await axios.get(`${API_BASE}/household/all`, {
    headers: getHeaders(),
  });
  return response.data.data || [];
}

export async function deleteHousehold(householdId: string): Promise<any> {
  const response = await axios.post(
    `${API_BASE}/household/delete`,
    { householdId },
    { headers: getHeaders() }
  );
  return response.data;
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const response = await axios.get(
    `${API_BASE}/household-member/all/${householdId}`,
    { headers: getHeaders() }
  );
  return response.data.data || [];
}

export async function leaveHousehold(householdId: string): Promise<any> {
  const response = await axios.post(
    `${API_BASE}/household-member/leave/${householdId}`,
    {},
    { headers: getHeaders() }
  );
  return response.data;
}
