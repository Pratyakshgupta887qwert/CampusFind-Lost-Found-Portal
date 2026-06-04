import React, { useState } from 'react';
import { apiRequest } from './api';

const allowedDomains = ['gla.ac.in', 'glau.ac.in', 'student.gla.ac.in'];

const LandingPage = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const domain = email.split('@')[1]?.toLowerCase();
    setError('');
    setNotice('');

    if (mode === 'register' && !name.trim()) {
      setError('Enter your name to continue.');
      return;
    }

    if (!domain || !allowedDomains.includes(domain)) {
      setError('Use a college-authorized email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      if (pendingVerification) {
        const data = await apiRequest('/api/auth/verify', {
          method: 'POST',
          body: JSON.stringify({ email, code: verificationCode }),
        });
        onAuthenticated(data);
        return;
      }

      if (mode === 'login') {
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        onAuthenticated(data);
        return;
      }

      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setPendingVerification(true);
      setNotice(data.devVerificationCode ? `${data.message} Code: ${data.devVerificationCode}` : data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 font-bold text-xl tracking-wide">
            {/* Minimalist 4-square logo */}
            <div className="grid grid-cols-2 gap-[2px] w-5 h-5">
              <div className="bg-[#f25022]"></div>
              <div className="bg-[#7fba00]"></div>
              <div className="bg-[#00a4ef]"></div>
              <div className="bg-[#ffb900]"></div>
            </div>
            <span>GLAU Lost & Found</span>
          </div>
          <div className="hidden md:flex space-x-6 pl-6 border-l border-zinc-700 text-sm text-zinc-300">
            <a href="#workflow" className="hover:text-yellow-400 transition-colors">System Flow</a>
            <a href="#rules" className="hover:text-yellow-400 transition-colors">Golden Rule</a>
            <a href="#feed" className="hover:text-yellow-400 transition-colors">Live Feed</a>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <button onClick={() => document.getElementById('college-login')?.focus()} className="hidden sm:inline hover:underline cursor-pointer">
            College Email Login
          </button>
          <div className="w-8 h-8 rounded-full border border-zinc-500 flex items-center justify-center cursor-pointer hover:border-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-20 overflow-hidden min-h-[70vh]">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 z-10 space-y-6">
          <h1 className="text-5xl md:text-7xl font-mono text-[#00a4ef] leading-tight font-bold tracking-tighter">
            Lost & Found <br />
            Portal for <span className="text-white">Campus.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-md">
            A real-time campus-wide system to recover lost items safely and simply. No private chat. No admin dependency. Only logic, transparency, and confirmation.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button onClick={() => document.getElementById('college-login')?.focus()} className="bg-[#ffb900] text-black px-6 py-3 font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2">
              Report Lost Item
              <span>&gt;</span>
            </button>
            <button onClick={() => document.getElementById('college-login')?.focus()} className="border border-[#ffb900] text-[#ffb900] px-6 py-3 font-bold hover:bg-[#ffb900]/10 transition-colors flex items-center gap-2">
              Report Found Item
              <span>&gt;</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 border border-zinc-800 bg-[#0a0a0a] p-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="flex gap-2 md:col-span-3">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setPendingVerification(false);
                  setError('');
                  setNotice('');
                }}
                className={`border px-3 py-2 text-xs font-bold ${mode === 'register' ? 'border-[#00a4ef] text-[#00a4ef]' : 'border-zinc-800 text-zinc-500'}`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setPendingVerification(false);
                  setError('');
                  setNotice('');
                }}
                className={`border px-3 py-2 text-xs font-bold ${mode === 'login' ? 'border-[#00a4ef] text-[#00a4ef]' : 'border-zinc-800 text-zinc-500'}`}
              >
                Login
              </button>
            </div>
            {mode === 'register' && !pendingVerification && (
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                className="border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
              />
            )}
            <input
              id="college-login"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="college email"
              className="border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
            />
            {!pendingVerification && (
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password"
                className="border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
              />
            )}
            {pendingVerification && (
              <input
                type="text"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="6-digit code"
                className="border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
              />
            )}
            <button type="submit" className="bg-[#00a4ef] px-4 py-2 text-sm font-bold text-black hover:bg-sky-400">
              {pendingVerification ? 'Verify Code' : mode === 'login' ? 'Login' : 'Register'}
            </button>
            {notice && <p className="text-xs text-[#7fba00] md:col-span-3">{notice}</p>}
            {error && <p className="text-xs text-[#f25022] md:col-span-3">{error}</p>}
          </form>
        </div>

        {/* Right Abstract Graphics (Replicating the colorful blocks) */}
        <div className="w-full md:w-1/2 h-[400px] relative mt-12 md:mt-0 opacity-90">
          <div className="absolute top-10 right-20 w-32 h-48 bg-[#e3008c]"></div>
          <div className="absolute top-24 right-40 w-40 h-32 bg-[#7fba00] z-10 mix-blend-screen"></div>
          <div className="absolute bottom-10 right-10 w-48 h-40 bg-[#00a4ef] z-0"></div>
          <div className="absolute top-0 right-10 w-20 h-20 bg-[#ffb900]"></div>
          <div className="absolute bottom-20 right-60 w-24 h-40 bg-[#68217a] z-20"></div>
          
          {/* Faux Video Player/Card Overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border border-zinc-800 p-6 w-72 shadow-2xl z-30">
             <div className="bg-[#00a4ef] text-black text-xs font-bold inline-block px-2 py-1 mb-4">REAL-TIME FEED</div>
             <h3 className="text-2xl font-mono font-bold text-[#00a4ef] leading-tight mb-2">Live campus notifications</h3>
             <p className="text-sm text-zinc-400">New posts appear instantly. No page refresh needed.</p>
          </div>
        </div>
      </main>

      {/* Feature / Workflow Section (Replicating the video grid) */}
      <section className="px-8 md:px-16 py-20 bg-[#0a0a0a]" id="workflow">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 font-mono tracking-tight">Complete system <br/> flow and logic</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-black border border-zinc-800 hover:border-zinc-600 transition-colors group cursor-pointer">
            <div className="h-48 bg-zinc-900 relative overflow-hidden flex items-end">
               <div className="w-full h-1/2 flex">
                 <div className="w-1/3 h-full bg-[#e3008c]"></div>
                 <div className="w-1/3 h-full bg-[#ffb900] opacity-80"></div>
                 <div className="w-1/3 h-full bg-[#00a4ef]"></div>
               </div>
            </div>
            <div className="p-6">
              <div className="bg-[#00a4ef] text-black text-xs font-bold inline-block px-2 py-1 mb-3">STEP 01</div>
              <h3 className="text-xl font-bold mb-2 group-hover:underline">Lost Item Post</h3>
              <p className="text-zinc-400 text-sm">User enters item details and location. A real-time notification is instantly sent to all logged-in users on campus.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-black border border-zinc-800 hover:border-zinc-600 transition-colors group cursor-pointer">
            <div className="h-48 bg-zinc-900 relative overflow-hidden flex items-end">
               <div className="w-full h-1/2 flex">
                 <div className="w-1/2 h-full bg-[#7fba00]"></div>
                 <div className="w-1/2 h-full bg-[#68217a] opacity-80"></div>
               </div>
            </div>
            <div className="p-6">
              <div className="bg-[#00a4ef] text-black text-xs font-bold inline-block px-2 py-1 mb-3">STEP 02</div>
              <h3 className="text-xl font-bold mb-2 group-hover:underline">Found Item Response</h3>
              <p className="text-zinc-400 text-sm">Finder clicks "I Found This" or makes an independent post. Finder's name and collection location become publicly visible.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-black border border-zinc-800 hover:border-zinc-600 transition-colors group cursor-pointer">
            <div className="h-48 bg-zinc-900 relative overflow-hidden flex items-end">
               <div className="w-full h-1/2 flex">
                 <div className="w-1/4 h-full bg-[#f25022]"></div>
                 <div className="w-2/4 h-full bg-[#00a4ef]"></div>
                 <div className="w-1/4 h-full bg-[#ffb900]"></div>
               </div>
            </div>
            <div className="p-6">
              <div className="bg-[#00a4ef] text-black text-xs font-bold inline-block px-2 py-1 mb-3">STEP 03 & 04</div>
              <h3 className="text-xl font-bold mb-2 group-hover:underline">The Golden Rule</h3>
              <p className="text-zinc-400 text-sm">Finder sends a Return Request to the original poster. No approval from the lost-item poster = NO ITEM RETURN.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Massive Footer Section */}
      <footer className="border-t-[8px] border-[#00a4ef] bg-black pt-16 pb-8 px-8 md:px-16 text-xs text-zinc-400">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          
          <div className="col-span-2 md:col-span-1">
             <h4 className="text-white font-bold mb-4 text-sm">Smart Enhancements</h4>
             <ul className="space-y-3">
               <li><a href="#" className="hover:text-white">Auto-Expiry System</a></li>
               <li><a href="#" className="hover:text-white">Matching Suggestions</a></li>
               <li><a href="#" className="hover:text-white">Trust & Badge System</a></li>
               <li><a href="#" className="hover:text-white">Real-Time Live Feed</a></li>
               <li><a href="#" className="hover:text-white">Installable PWA</a></li>
             </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
             <h4 className="text-white font-bold mb-4 text-sm">Portal Rules</h4>
             <ul className="space-y-3">
               <li><a href="#" className="hover:text-white">College Email Only</a></li>
               <li><a href="#" className="hover:text-white">One Account Per Person</a></li>
               <li><a href="#" className="hover:text-white">No Private Chats</a></li>
               <li><a href="#" className="hover:text-white">Owner Approval Logic</a></li>
             </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
             <h4 className="text-white font-bold mb-4 text-sm">Analytics Dashboard</h4>
             <ul className="space-y-3">
               <li><a href="#" className="hover:text-white">Total Items Lost</a></li>
               <li><a href="#" className="hover:text-white">Successfully Returned</a></li>
               <li><a href="#" className="hover:text-white">Most Helpful Users</a></li>
               <li><a href="#" className="hover:text-white">Recovery Success Rate</a></li>
             </ul>
          </div>
          
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-zinc-800 pt-8">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
             <a href="https://github.com/Pratyakshgupta887qwert/Lost-Found-Portal-for-GLAU-Campus" target="_blank" rel="noreferrer" className="hover:text-white">GitHub Repository</a>
             <a href="#" className="hover:text-white">Campus Security Policy</a>
             <a href="#" className="hover:text-white">Report Misuse</a>
          </div>
          <div>
            © {new Date().getFullYear()} Lost & Found Portal for Campus. Built securely.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
