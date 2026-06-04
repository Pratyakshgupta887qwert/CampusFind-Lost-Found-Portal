import React, { useEffect, useState } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import { apiRequest, clearSession, getStoredSession, storeSession } from './api';

function App() {
  const [session, setSession] = useState(() => getStoredSession());
  const [checkingSession, setCheckingSession] = useState(Boolean(session?.token));
  const sessionToken = session?.token;

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionToken) {
        setCheckingSession(false);
        return;
      }

      try {
        const data = await apiRequest('/api/auth/me', { token: sessionToken });
        const nextSession = { token: sessionToken, user: data.user };
        storeSession(nextSession);
        setSession(nextSession);
      } catch {
        clearSession();
        setSession(null);
      } finally {
        setCheckingSession(false);
      }
    };

    verifySession();
  }, [sessionToken]);

  const handleAuthenticated = (nextSession) => {
    storeSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-mono text-[#00a4ef]">
        Checking secure session...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black">
      {session ? (
        <Dashboard session={session} onLogout={handleLogout} />
      ) : (
        <LandingPage onAuthenticated={handleAuthenticated} />
      )}
    </div>
  );
}

export default App;
