const TOKEN_KEY = 'campusfind-token';
const USER_KEY = 'campusfind-user';

export const getStoredSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  return token && user ? { token, user: JSON.parse(user) } : null;
};

export const storeSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const apiRequest = async (path, { token, ...options } = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
};
