import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border text-sm font-medium transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-500/10'
                : isError
                ? 'bg-white border-rose-300 text-rose-800 shadow-rose-500/10'
                : 'bg-white border-blue-300 text-blue-800 shadow-blue-500/10'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {isError && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            <span className="flex-1 text-slate-800">{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
