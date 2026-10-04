import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Phone, Mail, ArrowUpRight, Heart } from 'lucide-react';
import PixelBanner from './PixelBanner';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#d0d7de] mt-auto">
      <PixelBanner />

      <div className="max-w-[1440px] mx-auto">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 lg:divide-x divide-[#d0d7de]">
          {/* Brand & Purpose Column */}
          <div className="lg:col-span-4 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-black tracking-tighter text-xs">
                CF
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#1f2328]">
                CampusFind <span className="font-mono text-xs text-[#238636]">'26</span>
              </span>
            </div>
            
            <p className="text-sm text-[#59636e] leading-relaxed max-w-sm">
              The official centralized recovery portal connecting students, staff, and campus police to reunite misplaced items with their rightful owners in record time.
            </p>

            <div className="pt-2 font-mono text-xs text-[#1f2328] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2da44e]"></span>
                <span className="font-semibold">STATUS: ALL 14 CAMPUS STATIONS ACTIVE</span>
              </div>
              <p className="text-[#59636e]">Average recovery turnaround: 2.4 hours</p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-3 p-6 md:p-8 space-y-3">
            <span className="font-mono text-xs text-[#59636e] tracking-wider uppercase">
              dev.navigation()
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-[#1f2328] hover:text-[#0969da] flex items-center justify-between group">
                  <span>Portal Overview</span>
                  <span className="font-mono text-xs text-[#59636e] group-hover:translate-x-0.5 transition-transform">↗</span>
                </Link>
              </li>
              <li>
                <Link to="/lost-items" className="text-[#1f2328] hover:text-[#0969da] flex items-center justify-between group">
                  <span>Active Lost Database</span>
                  <span className="font-mono text-xs text-[#59636e] group-hover:translate-x-0.5 transition-transform">↗</span>
                </Link>
              </li>
              <li>
                <Link to="/found-items" className="text-[#1f2328] hover:text-[#0969da] flex items-center justify-between group">
                  <span>Recovered Property Hold</span>
                  <span className="font-mono text-xs text-[#59636e] group-hover:translate-x-0.5 transition-transform">↗</span>
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="text-[#1f2328] hover:text-[#0969da] flex items-center justify-between group">
                  <span>Report Misplaced Belonging</span>
                  <span className="font-mono text-xs text-[#59636e] group-hover:translate-x-0.5 transition-transform">↗</span>
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="text-[#1f2328] hover:text-[#0969da] flex items-center justify-between group">
                  <span>Log Found Campus Property</span>
                  <span className="font-mono text-xs text-[#59636e] group-hover:translate-x-0.5 transition-transform">↗</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Desks & Stations */}
          <div className="lg:col-span-3 p-6 md:p-8 space-y-3">
            <span className="font-mono text-xs text-[#59636e] tracking-wider uppercase">
              station.locations()
            </span>
            <div className="space-y-3 text-xs text-[#59636e]">
              <div>
                <p className="font-semibold text-[#1f2328]">Main Campus Safety HQ</p>
                <p>Security Bldg A, Ground Floor (24/7)</p>
              </div>
              <div>
                <p className="font-semibold text-[#1f2328]">Student Union Service Desk</p>
                <p>Commons Plaza Room 102 (8 AM - 10 PM)</p>
              </div>
              <div>
                <p className="font-semibold text-[#1f2328]">University Library Helpdesk</p>
                <p>Floor 1 Entrance Turnstiles</p>
              </div>
            </div>
          </div>

          {/* Emergency & Contacts */}
          <div className="lg:col-span-2 p-6 md:p-8 space-y-3 bg-[#f6f8fa]">
            <span className="font-mono text-xs text-[#59636e] tracking-wider uppercase">
              contact.dispatch()
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#1f2328]">
                <Phone className="w-3.5 h-3.5 text-[#238636]" />
                <span className="font-mono font-medium">(555) 492-3463</span>
              </div>
              <div className="flex items-center gap-2 text-[#1f2328]">
                <Mail className="w-3.5 h-3.5 text-[#0969da]" />
                <span className="truncate">lostfound@campus.edu</span>
              </div>
              <div className="pt-3">
                <Link
                  to="/report-found"
                  className="block w-full py-2 px-3 text-center text-xs font-semibold bg-white border border-[#d0d7de] hover:border-black text-[#1f2328] transition-colors"
                >
                  Turn In Found Item
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Monospace Legal/System Tag */}
        <div className="border-t border-[#d0d7de] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#59636e] gap-2 font-mono">
          <div>
            <span>© 2026 CampusFind Portal. Built for university community recovery.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>v2.4.0-universe</span>
            <span>•</span>
            <span className="text-[#238636] flex items-center gap-1">
              <span>●</span> SYSTEM ENCRYPTED
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
