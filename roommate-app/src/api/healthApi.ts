import Api from '@/api/axios';

export const pingHealth = async () => {
  try {
    const response = await Api.get('/health');
    return response;
  } catch (error) {
    console.error('Health ping failed:', error);
    // Suppress error so it doesn't break the UI
    return null;
  }
};
