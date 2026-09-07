import { createContext, useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

export type ShowToast = (message: string, ms?: number) => void;

export const ToastContext = createContext<ShowToast | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

function ToastProvider({ children }: ToastProviderProps) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback<ShowToast>((msg, ms = 2500) => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), ms);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast${visible ? " show" : ""}`} id="toast">
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider