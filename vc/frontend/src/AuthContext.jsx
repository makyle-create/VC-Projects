import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  // True after an explicit log out, so the next person to sign in isn't sent to the previous person's page.
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    // Signed out automatically when the API says our token is no longer valid.
    const expired = () => setUser(null);
    window.addEventListener('auth:expired', expired);

    if (!localStorage.getItem('token')) {
      setReady(true);
    } else {
      api.get('/me')
        .then((r) => setUser(r.data))
        .catch((e) => {
          // Only discard the token when the server says it's invalid. A slow or
          // sleeping server must not log everybody out.
          if (e?.response?.status === 401) localStorage.removeItem('token');
        })
        .finally(() => setReady(true));
    }
    return () => window.removeEventListener('auth:expired', expired);
  }, []);

  const save = ({ token, user }) => { localStorage.setItem('token', token); setLoggedOut(false); setUser(user); };
  const login = async (email, password) => save((await api.post('/login', { email, password })).data);
  const register = async (form) => save((await api.post('/register', form)).data);
  const logout = async () => {
    try { await api.post('/logout'); } catch { /* token may already be invalid */ }
    localStorage.removeItem('token'); setLoggedOut(true); setUser(null);
  };

  return <Ctx.Provider value={{ user, setUser, ready, loggedOut, login, register, logout }}>{children}</Ctx.Provider>;
}
