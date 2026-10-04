import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemContext';
import { 
  ArrowUpRight, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Building 
} from 'lucide-react';
import PixelBanner from '../components/PixelBanner';

export default function ReportFound() {
  const navigate = useNavigate();
  const { user, notify } = useAuth();
  const { addFoundItem } = useItems();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Accessories',
    location: 'Student Union Plaza',
    custodyLocation: 'Main Campus Safety HQ',
    date: new Date().toISOString().split('T')[0],
    time: '1:00 PM',
    description: '',
    verificationHint: '',
    image: '',
    finderName: user ? user.name : '',
    finderRole: user ? user.role : 'Student Finder',
    finderContact: user ? user.email : ''
  });

  const [imagePreview, setImagePreview] = useState('');

  const sampleFoundImages = [
    { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
    { label: 'AirPods / Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80' },
    { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80' },
    { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80' },
    { label: 'Smart Device', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert('Please fill out the item title and description.');
      return;
    }

    const finalImage = imagePreview || formData.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

    const created = addFoundItem({
      ...formData,
      image: finalImage
    });

    notify(`Found property logged into custody registry: ${created.referenceCode}`);
    navigate('/found-items');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="border-b border-[#d0d7de] bg-[#f6f8fa] py-10 md:py-14">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 font-mono text-xs text-[#59636e] uppercase mb-2">
            <span>action.log_found_property()</span>
            <span>■</span>
            <span className="text-[#238636] font-semibold">Honorable Campus Citizen Action</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-[#1f2328] uppercase tracking-tight">
            Log Found Campus Property
          </h1>
          <p className="text-[#59636e] text-sm md:text-base mt-2 max-w-2xl">
            Did you find a student ID, laptop charger, headphones, or keys? Register it here so the rightful owner can locate and securely claim it.
          </p>
        </div>
      </section>

      <PixelBanner />

      {/* Main Form */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <form onSubmit={handleSubmit} className="border border-[#d0d7de] bg-white divide-y divide-[#d0d7de]">
            {/* Step 1: Item Info */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  01 / What Did You Find?
                </span>
                <span className="font-mono text-xs text-[#59636e]">* Required fields</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    ITEM TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Blue Hydro Flask 32oz with space stickers"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    aria-label="Item category"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans bg-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Keys & Wallets">Keys & Wallets</option>
                    <option value="IDs & Cards">IDs & Cards</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags & Backpacks">Bags & Backpacks</option>
                    <option value="Books & Supplies">Books & Supplies</option>
                    <option value="Apparel & Clothing">Apparel & Clothing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    WHERE WAS IT FOUND? *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Student Union Plaza outdoor benches"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    GENERAL VISUAL DESCRIPTION *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="General description of color, condition, and where it was situated. (Do NOT reveal private secret identifiers like lockscreen photos here!)..."
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Custody & Safekeeping */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  02 / Current Custody & Safekeeping
                </span>
                <span className="font-mono text-xs text-[#238636] font-semibold">Where can owner retrieve it?</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    SAFEKEEPING LOCATION *
                  </label>
                  <select
                    value={formData.custodyLocation}
                    onChange={(e) => setFormData({ ...formData, custodyLocation: e.target.value })}
                    aria-label="Safekeeping custody location"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans bg-white"
                  >
                    <option value="Main Campus Safety HQ">Main Campus Safety HQ (Building A)</option>
                    <option value="Student Union Info Desk (Room 101)">Student Union Info Desk (Room 101)</option>
                    <option value="Main Library Helpdesk Counter">Main Library Helpdesk Counter</option>
                    <option value="Athletics Front Desk">Athletics / Gym Front Desk</option>
                    <option value="Engineering Dept Office">Engineering Dept Office</option>
                    <option value="Kept Safely with Finder (On Campus)">Kept Safely with Finder (Meet on campus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    DATE FOUND *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Security Secret Question */}
            <div className="p-6 md:p-8 space-y-6 bg-[#f6f8fa]/60">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#238636]" />
                  <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                    03 / Ownership Proof Challenge (Anti-Fraud)
                  </span>
                </div>
                <span className="font-mono text-xs text-[#59636e]">Only true owner will know</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  SECURITY QUESTION / SECRET PROOF PROMPT *
                </label>
                <input
                  type="text"
                  required
                  value={formData.verificationHint}
                  onChange={(e) => setFormData({ ...formData, verificationHint: e.target.value })}
                  placeholder="e.g. Owner must state what Pokémon sticker is inside, or the lock screen image, or exact initials engraved."
                  className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans bg-white"
                />
                <p className="text-xs text-[#59636e] mt-1.5 leading-relaxed">
                  When someone clicks "Claim This Item", they will be required to answer this question.
                </p>
              </div>
            </div>

            {/* Step 4: Photo Presets */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  04 / Item Photo or Preset
                </span>
              </div>

              <div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {sampleFoundImages.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => { setImagePreview(s.url); setFormData(p => ({ ...p, image: s.url })); }}
                      className={`border p-1.5 flex flex-col items-center gap-1 transition-all ${
                        imagePreview === s.url ? 'border-black ring-2 ring-black' : 'border-[#d0d7de] hover:border-gray-400'
                      }`}
                    >
                      <img src={s.url} alt={s.label} className="w-full h-12 object-cover" />
                      <span className="text-[10px] font-mono text-[#1f2328] truncate">{s.label}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3.5 py-2 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>
            </div>

            {/* Step 5: Finder Details */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  05 / Your Info (Finder)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    YOUR NAME / IDENTIFIER
                  </label>
                  <input
                    type="text"
                    value={formData.finderName}
                    onChange={(e) => setFormData({ ...formData, finderName: e.target.value })}
                    placeholder="e.g. Jordan Lee (or Anonymous)"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    CAMPUS EMAIL (FOR CLAIM ALERTS)
                  </label>
                  <input
                    type="email"
                    value={formData.finderContact}
                    onChange={(e) => setFormData({ ...formData, finderContact: e.target.value })}
                    placeholder="student@campus.edu"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Submit Footer */}
            <div className="p-6 md:p-8 bg-[#f6f8fa] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#59636e] font-mono">
                REGISTRY: FOUND PROPERTY WILL BE PUBLICLY SEARCHABLE
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Register Found Property</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
