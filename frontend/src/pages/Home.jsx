import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { 
  ArrowUpRight, 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Compass,
  ArrowRight
} from 'lucide-react';
import ClaimModal from '../components/ClaimModal';
import PixelBanner from '../components/PixelBanner';

export default function Home() {
  const { lostItems, foundItems } = useItems();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('lost');

  const campusStations = [
    {
      name: "Main Campus Safety HQ",
      location: "Building A, Ground Floor",
      hours: "Open 24/7",
      phone: "ext. 4410",
      activeItems: 28,
      status: "Operational"
    },
    {
      name: "University Library Front Desk",
      location: "Central Library Entrance Turnstiles",
      hours: "7:30 AM – Midnight",
      phone: "ext. 1102",
      activeItems: 14,
      status: "Operational"
    },
    {
      name: "Student Union Info Counter",
      location: "Student Commons, Room 101",
      hours: "8:00 AM – 10:00 PM",
      phone: "ext. 2240",
      activeItems: 19,
      status: "Operational"
    },
    {
      name: "Athletics & Recreation Center",
      location: "Gymnasium Equipment Office",
      hours: "6:00 AM – 11:00 PM",
      phone: "ext. 3315",
      activeItems: 7,
      status: "Operational"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION - GITHUB UNIVERSE '26 STYLE */}
      <section className="border-b border-[#d0d7de] relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 pixel-pattern opacity-40 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto">
          {/* Main Giant Banner Header */}
          <div className="border-b border-[#d0d7de] p-6 md:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
              <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[#59636e] uppercase">
                october 2026 / university recovery initiative / in-person & digital ■
              </span>
              <span className="font-mono text-xs text-[#238636] font-bold bg-[#dafbe1] px-2.5 py-1 border border-[#4ac26b]">
                ● RECOVERY DESKS ACTIVE
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-[#1f2328] uppercase leading-[0.9]">
              CAMPUS<span className="text-[#238636]">FIND</span><span className="text-black">'26</span>
            </h1>

            <p className="mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-[#59636e] font-normal max-w-4xl leading-snug">
              Campus is where misplaced belongings find their way home. The unified recovery network uniting students, professors, and campus safety.
            </p>
          </div>

          {/* Split Two-Column Universe Style Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#d0d7de]">
            {/* Left Column: Visual Media & Dynamic Tag */}
            <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-[#59636e]">
                  <span>reconnect.hub()</span>
                  <span>SAN FRANCISCO CAMPUS</span>
                </div>

                <div className="relative group overflow-hidden border border-[#d0d7de] bg-[#f6f8fa] aspect-video">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                    alt="Campus recovery center"
                    className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#56d364] font-bold">
                      Central Campus Union Desk
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold font-display mt-1">
                      Over 18 items returned in the last 24 hours alone.
                    </h3>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/report-lost"
                  className="px-6 py-3.5 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-base flex items-center gap-2 transition-all shadow-xs"
                >
                  <span>Report a Lost Item</span>
                  <ArrowUpRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/report-found"
                  className="px-6 py-3.5 bg-white border border-[#d0d7de] hover:border-black text-[#1f2328] font-semibold text-base flex items-center gap-2 transition-all hover:bg-[#f6f8fa]"
                >
                  <span>Report a Found Item</span>
                  <ArrowUpRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/lost-items"
                  className="px-4 py-3.5 text-sm font-semibold text-[#59636e] hover:text-black transition-colors flex items-center gap-1 font-mono"
                >
                  <span>Explore All Items</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Numbers & Highlights */}
            <div className="lg:col-span-5 p-6 md:p-10 flex flex-col justify-between space-y-8 bg-[#f6f8fa]/50">
              <div className="space-y-6">
                <span className="font-mono text-xs text-[#59636e] tracking-wider uppercase block">
                  campus.telemetry()
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-[#d0d7de]">
                    <div className="text-3xl md:text-4xl font-extrabold font-display text-[#1f2328]">
                      4,820+
                    </div>
                    <div className="font-mono text-xs text-[#59636e] mt-1">
                      ITEMS RECOVERED
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-[#d0d7de]">
                    <div className="text-3xl md:text-4xl font-extrabold font-display text-[#238636]">
                      96.4%
                    </div>
                    <div className="font-mono text-xs text-[#59636e] mt-1">
                      RETURN ACCURACY
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-[#d0d7de]">
                    <div className="text-3xl md:text-4xl font-extrabold font-display text-[#1f2328]">
                      14
                    </div>
                    <div className="font-mono text-xs text-[#59636e] mt-1">
                      SECURITY DESKS
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-[#d0d7de]">
                    <div className="text-3xl md:text-4xl font-extrabold font-display text-[#0969da]">
                      &lt; 2.4h
                    </div>
                    <div className="font-mono text-xs text-[#59636e] mt-1">
                      AVG RESPONSE TIME
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white border border-[#d0d7de] space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#238636]" />
                    <span className="font-bold text-sm text-[#1f2328]">
                      Tamper-Proof Verification Protocol
                    </span>
                  </div>
                  <p className="text-xs text-[#59636e] leading-relaxed">
                    Valuable tech, IDs, and keys are protected with blind proof matching. Claims require lock screen demonstration, serial verification, or student photo identification.
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="font-mono text-xs text-[#59636e] border-t border-[#d0d7de] pt-4 flex items-center justify-between">
                <span>SYSTEM VERSION 2026.4</span>
                <span className="text-[#238636] font-semibold">ALL ZONES ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PixelBanner />

      {/* 2. RECENT LOST & FOUND LIVE FEED */}
      <section className="border-b border-[#d0d7de] py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#d0d7de] gap-4">
            <div>
              <span className="font-mono text-xs text-[#59636e] tracking-wider uppercase block">
                campus.live_registry()
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display text-[#1f2328] mt-1">
                Recent Campus Postings
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                to="/lost-items"
                className="px-4 py-2 border border-[#d0d7de] hover:border-black text-xs font-mono font-semibold text-[#1f2328] hover:bg-[#f6f8fa] transition-colors"
              >
                VIEW ALL LOST ({lostItems.length}) →
              </Link>
              <Link
                to="/found-items"
                className="px-4 py-2 bg-[#238636] hover:bg-[#2ea44f] text-white text-xs font-mono font-semibold transition-colors"
              >
                VIEW ALL FOUND ({foundItems.length}) →
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostItems.length === 0 ? (
              <div className="p-8 border border-[#d0d7de] bg-[#f6f8fa] text-center text-sm text-[#59636e] col-span-full font-mono">
                No active lost items reported on campus.
              </div>
            ) : (
              lostItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="border border-[#d0d7de] bg-white flex flex-col justify-between hover:border-black transition-all group"
                >
                  <div>
                    <div className="relative aspect-16/9 overflow-hidden bg-[#f6f8fa] border-b border-[#d0d7de]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 bg-black text-white">
                          LOST ITEM
                        </span>
                        {item.reward && (
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]">
                            {item.reward}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#59636e]">
                        <span className="text-[#0969da] uppercase font-semibold">{item.category}</span>
                        <span>{item.date}</span>
                      </div>

                      <h3 className="font-bold text-lg text-[#1f2328] group-hover:text-[#0969da] transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#59636e] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-[#59636e] font-mono">
                        <MapPin className="w-3.5 h-3.5 text-[#cf222e] shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#d0d7de] p-4 bg-[#f6f8fa] flex items-center justify-between">
                    <span className="font-mono text-xs text-[#59636e]">{item.referenceCode}</span>
                    <button
                      onClick={() => { setSelectedItem(item); setSelectedType('lost'); }}
                      className="font-mono text-xs font-semibold text-[#1f2328] hover:text-[#0969da] flex items-center gap-1"
                    >
                      <span>I Found This</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Found Items Row preview */}
          <div className="mt-8 pt-8 border-t border-[#d0d7de]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#238636]">
                ● In Custody / Awaiting Claim at Campus Desks
              </span>
              <span className="font-mono text-xs text-[#59636e]">Showing verified drop-offs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foundItems.length === 0 ? (
                <div className="p-6 border border-[#d0d7de] bg-[#f6f8fa] text-center text-sm text-[#59636e] col-span-full font-mono">
                  No active found property in custody right now.
                </div>
              ) : (
                foundItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#d0d7de] p-4 flex gap-4 items-center bg-[#f6f8fa] hover:bg-white transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover border border-[#d0d7de] shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#238636] text-white">
                          FOUND
                        </span>
                        <span className="font-mono text-[11px] text-[#59636e] truncate">
                          Held at: {item.custodyLocation}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1f2328] truncate">{item.title}</h4>
                      <p className="text-xs text-[#59636e] line-clamp-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedItem(item); setSelectedType('found'); }}
                      className="px-3 py-2 bg-black hover:bg-[#238636] text-white text-xs font-mono font-semibold transition-colors shrink-0"
                    >
                      Claim ↗
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROTOCOL / HOW IT WORKS - EDITORIAL BRUTALIST STYLE */}
      <section className="border-b border-[#d0d7de] py-14 md:py-20 bg-[#f6f8fa]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs text-[#59636e] tracking-wider uppercase block">
              .match-and-return/
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display text-[#1f2328] mt-2">
              Engineered for swift, verified campus handoffs.
            </h2>
            <p className="text-sm md:text-base text-[#59636e] mt-3">
              CampusFind replaces chaotic group chats and poster boards with an organized, privacy-first recovery workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-[#d0d7de] bg-white divide-y md:divide-y-0 md:divide-x divide-[#d0d7de]">
            <div className="p-8 space-y-4">
              <span className="font-mono text-4xl font-extrabold text-[#d0d7de] block">01/</span>
              <h3 className="text-xl font-bold font-display text-[#1f2328]">
                Log with Precision
              </h3>
              <p className="text-sm text-[#59636e] leading-relaxed">
                Whether reporting a lost laptop or a set of car keys found in the cafeteria, submit precise timestamps, location rooms, photos, and private verification clues.
              </p>
              <div className="pt-2 font-mono text-xs text-[#238636] flex items-center gap-1 font-semibold">
                <span>&gt; Instant registry broadcast</span>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <span className="font-mono text-4xl font-extrabold text-[#d0d7de] block">02/</span>
              <h3 className="text-xl font-bold font-display text-[#1f2328]">
                AI Match & Station Sync
              </h3>
              <p className="text-sm text-[#59636e] leading-relaxed">
                Our portal immediately checks against items handed into the library, dining hall, or campus police desks, cross-referencing descriptions and locations.
              </p>
              <div className="pt-2 font-mono text-xs text-[#0969da] flex items-center gap-1 font-semibold">
                <span>&gt; Real-time station alerts</span>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <span className="font-mono text-4xl font-extrabold text-[#d0d7de] block">03/</span>
              <h3 className="text-xl font-bold font-display text-[#1f2328]">
                Proof & Verified Release
              </h3>
              <p className="text-sm text-[#59636e] leading-relaxed">
                Items are never released to strangers. Owners present Student ID cards and verify secret markers before campus officers or finders hand the property back.
              </p>
              <div className="pt-2 font-mono text-xs text-[#1f2328] flex items-center gap-1 font-semibold">
                <span>&gt; Zero fraudulent claims</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAMPUS STATIONS DIRECTORY */}
      <section className="border-b border-[#d0d7de] py-14 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-10 pb-4 border-b border-[#d0d7de]">
            <div>
              <span className="font-mono text-xs text-[#59636e] tracking-wider uppercase">
                desks.directory()
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display text-[#1f2328] mt-1">
                Official Drop-Off & Safe Keeping Desks
              </h2>
            </div>
            <span className="font-mono text-xs text-[#59636e]">
              Need to drop off an item right now? Visit any desk below.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campusStations.map((station, idx) => (
              <div
                key={idx}
                className="border border-[#d0d7de] p-6 bg-white space-y-4 flex flex-col justify-between hover:border-black transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#238636] uppercase bg-green-50 px-2 py-0.5 border border-green-200">
                      {station.status}
                    </span>
                    <span className="font-mono text-xs text-[#59636e]">
                      {station.activeItems} in safe
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#1f2328] font-display">
                    {station.name}
                  </h3>
                  <p className="text-xs text-[#59636e] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#59636e] shrink-0" />
                    <span>{station.location}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-[#eaeef2] text-xs font-mono space-y-1">
                  <div className="text-[#1f2328] font-semibold">{station.hours}</div>
                  <div className="text-[#59636e]">{station.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GITHUB UNIVERSE STYLE BIG GREEN CTA BANNER */}
      <section className="bg-black text-white p-8 md:p-16 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-xs font-bold text-[#56d364] tracking-widest uppercase">
              JOIN 24,000+ STUDENTS & FACULTY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
              Lost something on campus today? Don't wait.
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              The earlier a lost report is entered into the system, the faster security desks can flag incoming found property.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              to="/report-lost"
              className="px-8 py-4 bg-[#238636] hover:bg-[#2ea44f] text-white font-bold text-base flex items-center gap-2 transition-all"
            >
              <span>Submit Lost Report</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>

            <Link
              to="/found-items"
              className="px-8 py-4 bg-transparent border border-white hover:bg-white hover:text-black text-white font-bold text-base transition-colors"
            >
              Search Found Items
            </Link>
          </div>
        </div>
      </section>

      {/* Claim / Contact Modal */}
      {selectedItem && (
        <ClaimModal
          item={selectedItem}
          type={selectedType}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
