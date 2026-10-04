import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ArrowUpRight
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'Lost Items', path: '/lost-items' },
    { label: 'Found Items', path: '/found-items' },
  ];

  const handleReportItem = () => {
    if (user) {
      navigate('/report-lost');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#d0d7de]">
      {/* Top micro-announcement banner like GitHub Universe */}
      <div className="bg-[#f6f8fa] border-b border-[#eaeef2] px-4 py-1 text-center font-mono text-[11px] text-[#59636e] flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2da44e] animate-pulse"></span>
          <span>CAMPUS REGISTRY 2026 // LIVE RECOVERY SYSTEM</span>
        </div>
        <div className="mx-auto sm:mx-0 font-medium text-[#1f2328]">
          <span>Central Student Union & Campus Security Desks Online</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[#0969da] hover:underline cursor-pointer">Security Dispatch: ext. 4410</span>
          <span>■</span>
          <span>SF CAMPUS</span>
        </div>
      </div>

      {/* Main segmented navigation */}
      <div className="max-w-[1440px] mx-auto flex items-stretch h-14 md:h-16">
        {/* Brand Section */}
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 md:px-6 border-r border-[#d0d7de] hover:bg-[#f6f8fa] transition-colors group shrink-0"
        >
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black tracking-tighter text-sm">
            CF
          </div>
          <div className="flex items-baseline">
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-[#1f2328]">
              CampusFind
            </span>
            <span className="font-mono text-xs font-bold text-[#238636] ml-0.5 tracking-tighter">
              '26
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links with Hairline Vertical Dividers */}
        <nav className="hidden lg:flex items-stretch flex-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 md:px-5 text-sm font-medium border-r border-[#d0d7de] transition-colors relative ${
                  active 
                    ? 'text-black bg-[#f6f8fa] font-semibold' 
                    : 'text-[#424a53] hover:text-black hover:bg-[#f6f8fa]'
                }`}
              >
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1f2328]" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action & Auth Section */}
        <div className="flex items-stretch ml-auto">
          {user ? (
            <div className="flex items-stretch">
              <Link
                to="/profile"
                className={`flex items-center gap-2.5 px-4 md:px-5 border-l border-[#d0d7de] hover:bg-[#f6f8fa] transition-colors ${
                  isActive('/profile') ? 'bg-[#f6f8fa] font-semibold' : ''
                }`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#d0d7de]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1f2328] text-white flex items-center justify-center text-xs font-bold border border-[#d0d7de]">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#1f2328] leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[#59636e] font-mono leading-none">
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Sign Out"
                className="hidden md:flex items-center justify-center px-3 border-l border-[#d0d7de] text-[#59636e] hover:text-[#cf222e] hover:bg-[#ffebe9] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-stretch">
              <Link
                to="/login"
                className={`flex items-center gap-2 px-4 md:px-5 border-l border-[#d0d7de] text-sm font-medium text-[#1f2328] hover:bg-[#f6f8fa] transition-colors ${
                  isActive('/login') ? 'bg-[#f6f8fa] font-semibold' : ''
                }`}
              >
                <User className="w-4 h-4 text-[#59636e]" />
                <span>Sign in</span>
              </Link>
              <Link
                to="/register"
                className={`flex items-center gap-2 px-4 md:px-5 border-l border-[#d0d7de] text-sm font-medium text-[#1f2328] hover:bg-[#f6f8fa] transition-colors ${
                  isActive('/register') ? 'bg-[#f6f8fa] font-semibold' : ''
                }`}
              >
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Green CTA — redirects to /login if unauthenticated */}
          <button
            onClick={handleReportItem}
            className="flex items-center justify-center gap-2 px-5 md:px-7 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-sm tracking-wide transition-all border-l border-[#238636] group"
          >
            <span>Report Item</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center px-4 border-l border-[#d0d7de] text-[#1f2328] hover:bg-[#f6f8fa]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#d0d7de] px-4 py-3 divide-y divide-[#eaeef2]">
          <div className="flex flex-col space-y-2 pb-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 text-sm font-medium rounded-none flex items-center justify-between ${
                  isActive(link.path)
                    ? 'bg-[#f6f8fa] text-black font-semibold'
                    : 'text-[#424a53] hover:bg-[#f6f8fa]'
                }`}
              >
                <span>{link.label}</span>
                <span className="font-mono text-xs text-[#59636e]">→</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between py-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-[#1f2328]"
                >
                  {user.avatar ? (
                    <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#1f2328] text-white flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span>My Profile ({user.name})</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs font-mono text-red-600 px-2 py-1 bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium border border-[#d0d7de] text-[#1f2328]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-[#1f2328] text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
