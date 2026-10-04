import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemContext';
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Bell
} from 'lucide-react';
import PixelBanner from '../components/PixelBanner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, notify } = useAuth();
  const { myLostItems, myFoundItems, claims, resolveItem } = useItems();

  const [activeTab, setActiveTab] = useState('lost');

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#f6f8fa]">
        <div className="border border-[#d0d7de] bg-white p-8 max-w-md w-full text-center space-y-4">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-sm mx-auto">
            CF
          </div>
          <h2 className="text-2xl font-bold font-display text-[#1f2328]">
            Sign in to view your profile
          </h2>
          <p className="text-xs text-[#59636e]">
            Access your active lost reports, custody drop-offs, and verification claims.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="py-2.5 bg-[#238636] hover:bg-[#2ea44f] text-white text-sm font-semibold transition-colors"
            >
              Sign In with Campus ID
            </Link>
            <Link
              to="/register"
              className="py-2.5 border border-[#d0d7de] hover:border-black text-[#1f2328] text-sm font-semibold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleResolve = async (itemId, type) => {
    try {
      await resolveItem(itemId, type);
      notify(type === 'lost' ? 'Item marked as Recovered!' : 'Item marked as Returned!');
    } catch (err) {
      notify('Failed to update status. Please try again.', 'error');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Profile Identity Strip */}
      <section className="border-b border-[#d0d7de] bg-[#f6f8fa] py-8 md:py-12">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-none border-2 border-[#1f2328] object-cover shrink-0 shadow-xs"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase px-2 py-0.5 bg-black text-white font-bold">
                    {user.role}
                  </span>
                  <span className="font-mono text-xs text-[#238636] font-bold bg-[#dafbe1] px-2 py-0.5 border border-[#4ac26b] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#1f2328] tracking-tight">
                  {user.name}
                </h1>
                <p className="text-xs md:text-sm text-[#59636e] font-mono">
                  {user.email} • ID: {user.studentId} • {user.department}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/report-lost"
                className="px-4 py-2.5 bg-[#238636] hover:bg-[#2ea44f] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Report Lost Item</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="px-4 py-2.5 border border-[#d0d7de] hover:border-black text-[#1f2328] text-xs font-mono font-semibold flex items-center gap-1.5 bg-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#d0d7de]">
            <div className="p-3 bg-white border border-[#d0d7de]">
              <span className="font-mono text-[10px] text-[#59636e] uppercase">TRUST SCORE</span>
              <div className="text-xl font-bold font-display text-[#238636] mt-0.5">
                {user.trustScore}%
              </div>
            </div>

            <div className="p-3 bg-white border border-[#d0d7de]">
              <span className="font-mono text-[10px] text-[#59636e] uppercase">COMMUNITY KARMA</span>
              <div className="text-xl font-bold font-display text-[#1f2328] mt-0.5">
                {user.karmaPoints} PTS
              </div>
            </div>

            <div className="p-3 bg-white border border-[#d0d7de]">
              <span className="font-mono text-[10px] text-[#59636e] uppercase">MY LOST REPORTS</span>
              <div className="text-xl font-bold font-display text-[#1f2328] mt-0.5">
                {myLostItems.length}
              </div>
            </div>

            <div className="p-3 bg-white border border-[#d0d7de]">
              <span className="font-mono text-[10px] text-[#59636e] uppercase">MY FOUND LOGS</span>
              <div className="text-xl font-bold font-display text-[#0969da] mt-0.5">
                {myFoundItems.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PixelBanner />

      {/* Tabs Navigation */}
      <section className="border-b border-[#d0d7de] sticky top-14 md:top-16 z-30 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center overflow-x-auto">
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-5 py-3.5 text-xs font-mono font-bold tracking-tight border-b-2 transition-colors shrink-0 ${
              activeTab === 'lost'
                ? 'border-black text-black bg-[#f6f8fa]'
                : 'border-transparent text-[#59636e] hover:text-black'
            }`}
          >
            MY LOST ITEMS ({myLostItems.length})
          </button>

          <button
            onClick={() => setActiveTab('found')}
            className={`px-5 py-3.5 text-xs font-mono font-bold tracking-tight border-b-2 transition-colors shrink-0 ${
              activeTab === 'found'
                ? 'border-black text-black bg-[#f6f8fa]'
                : 'border-transparent text-[#59636e] hover:text-black'
            }`}
          >
            ITEMS I TURNED IN ({myFoundItems.length})
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-5 py-3.5 text-xs font-mono font-bold tracking-tight border-b-2 transition-colors shrink-0 ${
              activeTab === 'claims'
                ? 'border-black text-black bg-[#f6f8fa]'
                : 'border-transparent text-[#59636e] hover:text-black'
            }`}
          >
            SUBMITTED CLAIMS ({claims.length})
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`px-5 py-3.5 text-xs font-mono font-bold tracking-tight border-b-2 transition-colors shrink-0 ${
              activeTab === 'badges'
                ? 'border-black text-black bg-[#f6f8fa]'
                : 'border-transparent text-[#59636e] hover:text-black'
            }`}
          >
            HONOR BADGES & CREDENTIALS
          </button>
        </div>
      </section>

      {/* Tab Contents */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          {/* TAB 1: My Lost Items */}
          {activeTab === 'lost' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaeef2]">
                <h3 className="text-xl font-bold font-display text-[#1f2328]">
                  My Reported Lost Belongings
                </h3>
                <Link
                  to="/report-lost"
                  className="font-mono text-xs text-[#238636] hover:underline font-semibold"
                >
                  + File Another Lost Report
                </Link>
              </div>

              {myLostItems.length === 0 ? (
                <div className="border border-[#d0d7de] p-10 text-center bg-[#f6f8fa] space-y-3">
                  <p className="text-sm text-[#59636e]">You have not reported any lost items currently.</p>
                  <Link
                    to="/report-lost"
                    className="inline-block px-5 py-2 bg-[#238636] text-white text-xs font-mono font-semibold"
                  >
                    Report a Lost Item ↗
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myLostItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-[#d0d7de] bg-white p-5 flex flex-col justify-between space-y-4 hover:border-black transition-colors"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-24 h-24 object-cover border border-[#d0d7de] shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 bg-black text-white">
                              {item.category}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#238636]">
                              {item.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-[#1f2328] truncate">{item.title}</h4>
                          <p className="text-xs text-[#59636e] line-clamp-2">{item.description}</p>
                          <div className="text-[11px] font-mono text-[#59636e]">
                            Last seen: {item.location}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#eaeef2] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#59636e]">{item.referenceCode}</span>
                        {item.status !== 'Recovered' && item.status !== 'Resolved / Recovered' ? (
                          <button
                            onClick={() => handleResolve(item.id, 'lost')}
                            className="px-3 py-1.5 bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b] hover:bg-[#238636] hover:text-white transition-colors font-bold"
                          >
                            Mark Recovered ✓
                          </button>
                        ) : (
                          <span className="text-[#238636] font-bold">RECOVERED & CLOSED</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Found Items */}
          {activeTab === 'found' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaeef2]">
                <h3 className="text-xl font-bold font-display text-[#1f2328]">
                  Items You Found & Registered
                </h3>
                <Link
                  to="/report-found"
                  className="font-mono text-xs text-[#238636] hover:underline font-semibold"
                >
                  + Turn In Another Found Item
                </Link>
              </div>

              {myFoundItems.length === 0 ? (
                <div className="border border-[#d0d7de] p-10 text-center bg-[#f6f8fa] space-y-3">
                  <p className="text-sm text-[#59636e]">You haven't logged any found property yet.</p>
                  <Link
                    to="/report-found"
                    className="inline-block px-5 py-2 bg-[#238636] text-white text-xs font-mono font-semibold"
                  >
                    Log Found Belonging ↗
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myFoundItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-[#d0d7de] bg-white p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-24 h-24 object-cover border border-[#d0d7de] shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 bg-[#238636] text-white">
                            {item.status}
                          </span>
                          <h4 className="font-bold text-base text-[#1f2328] truncate">{item.title}</h4>
                          <p className="text-xs text-[#59636e] line-clamp-2">{item.description}</p>
                          <div className="text-[11px] font-mono text-[#59636e]">
                            Custody: {item.custodyLocation}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#eaeef2] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#59636e]">{item.referenceCode}</span>
                        {item.status !== 'Returned' && item.status !== 'Resolved / Handed Over' ? (
                          <button
                            onClick={() => handleResolve(item.id, 'found')}
                            className="px-3 py-1.5 bg-black text-white hover:bg-[#238636] transition-colors"
                          >
                            Mark Returned ✓
                          </button>
                        ) : (
                          <span className="text-[#238636] font-bold">RETURNED & CLOSED</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Claims */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-display text-[#1f2328] pb-3 border-b border-[#eaeef2]">
                Your Active Verification Claims
              </h3>

              {claims.length === 0 ? (
                <div className="border border-[#d0d7de] p-10 text-center bg-[#f6f8fa] space-y-3">
                  <p className="text-sm text-[#59636e]">No active claim requests submitted yet.</p>
                  <Link
                    to="/found-items"
                    className="inline-block px-5 py-2 bg-black text-white text-xs font-mono font-semibold"
                  >
                    Browse Found Property Registry ↗
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="border border-[#d0d7de] p-5 bg-white space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1f2328]">CLAIM #{claim.id}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">
                          {claim.status}
                        </span>
                      </div>
                      <div className="text-[#59636e]">Submitted: {new Date(claim.dateSubmitted).toLocaleDateString()}</div>
                      <div className="text-[#1f2328]">Provided Proof: "{claim.proofDescription}"</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Badges */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-display text-[#1f2328] pb-3 border-b border-[#eaeef2]">
                Campus Citizen Honors & Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-[#d0d7de] p-6 bg-white space-y-3 text-center">
                  <div className="w-12 h-12 bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b] flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-[#1f2328]">Verified Campus Member</h4>
                  <p className="text-xs text-[#59636e]">
                    Authenticated via institutional email and University Registrar records.
                  </p>
                </div>

                <div className="border border-[#d0d7de] p-6 bg-white space-y-3 text-center">
                  <div className="w-12 h-12 bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-[#1f2328]">Gold Finder '26</h4>
                  <p className="text-xs text-[#59636e]">
                    Awarded for successfully turning in 3+ items with verified return to students.
                  </p>
                </div>

                <div className="border border-[#d0d7de] p-6 bg-white space-y-3 text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-[#1f2328]">Rapid Responder</h4>
                  <p className="text-xs text-[#59636e]">
                    Logs found property within 60 minutes of discovering it on campus grounds.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
