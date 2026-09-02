import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto flex items-center justify-between p-3 rounded shadow-lg border text-[11px] font-mono transition-all animate-slide-in cursor-pointer ${
              t.type === 'success'
                ? 'bg-[#0d1117] border-[#238636] text-[#3fb950]'
                : t.type === 'error'
                ? 'bg-[#0d1117] border-[#f85149] text-[#f85149]'
                : t.type === 'warning'
                ? 'bg-[#0d1117] border-[#d29922] text-[#d29922]'
                : 'bg-[#0d1117] border-[#58a6ff] text-[#58a6ff]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                {t.type === 'success'
                  ? 'check_circle'
                  : t.type === 'error'
                  ? 'error'
                  : t.type === 'warning'
                  ? 'warning'
                  : 'info'}
              </span>
              <span>{t.message}</span>
            </div>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant hover:text-white ml-2">
              close
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log('Success Toast:', msg),
      error: (msg) => console.log('Error Toast:', msg),
      info: (msg) => console.log('Info Toast:', msg),
      warning: (msg) => console.log('Warning Toast:', msg)
    };
  }
  return context;
};
