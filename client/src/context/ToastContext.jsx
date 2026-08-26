import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={`toast-enter flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium cursor-pointer 
          ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
            t.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
            t.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
            'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
          onClick={() => removeToast(t.id)}>
          <span className="text-lg leading-none">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <span className="flex-1">{t.message}</span>
          <button className="text-white/70 hover:text-white ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
