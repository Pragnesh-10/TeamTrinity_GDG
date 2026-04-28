const DEFAULT_API_URL = 'http://localhost:8000';

const normalizeBaseUrl = (value) => {
  if (!value) return DEFAULT_API_URL;
  return value.replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL);

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
