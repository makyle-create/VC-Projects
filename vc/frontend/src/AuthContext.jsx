import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api.get('/me').then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, []);

  const save = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); };
  const login = async (email, password) => save((await api.post('/login', { email, password })).data);
  const register = async (form) => save((await api.post('/register', form)).data);
  const logout = async () => {
    try { await api.post('/logout'); } catch { /* token may already be invalid */ }
    localStorage.removeItem('token'); setUser(null);
  };

  return <Ctx.Provider value={{ user, setUser, ready, login, register, logout }}>{children}</Ctx.Provider>;
}
