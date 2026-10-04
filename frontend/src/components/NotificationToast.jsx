import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast() {
  const { notification, notify } = useAuth();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1f2328] text-white border border-[#30363d] shadow-2xl rounded-none font-mono text-sm">
        {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#2da44e] shrink-0" />}
        {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-[#f85149] shrink-0" />}
        {notification.type === 'info' && <Info className="w-5 h-5 text-[#58a6ff] shrink-0" />}
        <span className="flex-1 font-sans text-xs tracking-tight">{notification.msg}</span>
        <button
          onClick={() => notify(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
