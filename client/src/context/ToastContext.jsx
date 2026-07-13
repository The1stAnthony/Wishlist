import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, duration = 2500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        zIndex: 9999, pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: '#1F2937', color: '#fff',
            padding: '0.6rem 1.25rem', borderRadius: '2rem',
            fontSize: '0.875rem', fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            animation: 'toast-in 0.2s ease',
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
