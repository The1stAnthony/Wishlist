import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

/**
 * Wraps the app and provides the current user + auth actions (login, logout, register)
 * to any component via the useAuth() hook.
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // On app load, check if a valid token is stored in localStorage
  // so users stay logged in after a page refresh
  useEffect(() => {
    const token = localStorage.getItem('alliwant_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios
        .get('/api/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token is expired or invalid — clear it
          localStorage.removeItem('alliwant_token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Saves the token and user to state after a successful login or register
  function handleAuthSuccess(user, token) {
    localStorage.setItem('alliwant_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  }

  async function register(name, email, password, birthday, display_name) {
    const res = await axios.post('/api/auth/register', { name, display_name, email, password, birthday });
    handleAuthSuccess(res.data.user, res.data.token);
    return res.data.user;
  }

  async function login(email, password) {
    const res = await axios.post('/api/auth/login', { email, password });
    handleAuthSuccess(res.data.user, res.data.token);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('alliwant_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }

  // Call this after a profile update so the navbar and other consumers see fresh data
  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Shorthand hook so components don't need to import AuthContext directly
export function useAuth() {
  return useContext(AuthContext);
}
