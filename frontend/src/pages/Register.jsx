import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import PixelBanner from '../components/PixelBanner';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    phone: '',
    role: 'Student',
    password: '',
    confirmPassword: '',
    terms: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    register(formData);
    navigate('/profile');
  };

  return (
    <div className="bg-[#f6f8fa] min-h-[calc(100vh-120px)] py-12 px-6">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black tracking-tighter text-base mx-auto">
            CF
          </div>
          <h2 className="text-3xl font-extrabold font-display text-[#1f2328] uppercase tracking-tight">
            Register Student / Staff Profile
          </h2>
          <p className="text-xs font-mono text-[#59636e]">
            JOIN THE UNIVERSITY'S CENTRAL LOST & FOUND VERIFICATION NETWORK
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-[#d0d7de] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  FULL LEGAL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  CAMPUS EMAIL *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jordan.lee@campus.edu"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  STUDENT / STAFF ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="STU-884021"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  ROLE ON CAMPUS *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  aria-label="Campus affiliation role"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans bg-white"
                >
                  <option value="Student">Undergraduate Student</option>
                  <option value="Graduate Student">Graduate / PhD Student</option>
                  <option value="Faculty">Faculty / Professor</option>
                  <option value="Campus Staff">University Staff / Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  DEPARTMENT / COLLEGE
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  PHONE NUMBER (SMS ALERTS)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  CONFIRM PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-xs text-[#59636e] leading-relaxed">
                  I agree to the University Honor Code and CampusFind Recovery Regulations. I acknowledge that falsified ownership claims violate campus conduct policy.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-4"
            >
              <span>Complete Campus Registration</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-[#eaeef2] pt-4 text-center">
            <p className="text-xs text-[#59636e]">
              Already have an activated account?{' '}
              <Link to="/login" className="font-semibold text-[#0969da] hover:underline">
                Sign in to existing profile →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
