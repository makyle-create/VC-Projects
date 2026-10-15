import { createContext, useCallback, useContext, useState } from 'react';
import Icon from './components/Icon';

const T = createContext(() => {});
export const useToast = () => useContext(T);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((text, kind = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, text, kind }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3800);
  }, []);
  return (
    <T.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((i) => <div key={i.id} className={`toast ${i.kind === 'err' ? 'err' : ''}`}><Icon name={i.kind === 'err' ? 'activity' : 'check'} />{i.text}</div>)}
      </div>
    </T.Provider>
  );
}
