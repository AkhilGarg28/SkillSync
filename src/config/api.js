export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanEndpoint.startsWith('/api') && baseUrl.endsWith('/api')) {
    return `${baseUrl.slice(0, -4)}${cleanEndpoint}`;
  }

  return `${baseUrl}${cleanEndpoint}`;
};
