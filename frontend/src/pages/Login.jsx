import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import PixelBanner from '../components/PixelBanner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result?.success) {
      navigate('/');
    } else {
      setError(result?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="bg-[#f6f8fa] min-h-[calc(100vh-120px)] flex flex-col justify-center py-12 px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black tracking-tighter text-base mx-auto">
            CF
          </div>
          <h2 className="text-3xl font-extrabold font-display text-[#1f2328] uppercase tracking-tight">
            Sign in to CampusFind
          </h2>
          <p className="text-xs font-mono text-[#59636e]">
            CENTRAL UNIVERSITY IDENTITY & RECOVERY SYSTEM
          </p>
        </div>

        {/* Standard Form */}
        <div className="border border-[#d0d7de] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                CAMPUS EMAIL / USERNAME
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@campus.edu"
                className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-medium text-[#1f2328]">
                  PASSWORD
                </label>
                <a href="#reset" onClick={(e) => e.preventDefault()} className="text-xs text-[#0969da] hover:underline font-mono">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-[#ffebe9] border border-[#ffc1ba] text-[#cf222e] text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#238636] hover:bg-[#2ea44f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>{isSubmitting ? 'Signing in…' : 'Sign In with University ID'}</span>
              {!isSubmitting && <ArrowUpRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="border-t border-[#eaeef2] pt-4 text-center">
            <p className="text-xs text-[#59636e]">
              New to the campus network?{' '}
              <Link to="/register" className="font-semibold text-[#0969da] hover:underline">
                Create student / faculty profile →
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center font-mono text-[11px] text-[#59636e] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#238636]" />
          <span>Protected by Campus Single Sign-On (SSO) Protocol</span>
        </div>
      </div>
    </div>
  );
}
