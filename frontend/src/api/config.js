// Ensure we always have the /api/v1 suffix, handling cases where user might omit it
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';
export const API_BASE_URL = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
