// config.js
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '/api/v1';
};

export const getStaticUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const apiUrl = getApiUrl();
  const baseUrl = apiUrl.replace('/api/v1', '');
  return `${baseUrl}${path}`;
};