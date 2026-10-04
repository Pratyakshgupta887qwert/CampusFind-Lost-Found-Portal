import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemContext';
import { 
  ArrowUpRight, 
  MapPin, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Shield,
  Upload
} from 'lucide-react';
import PixelBanner from '../components/PixelBanner';

export default function ReportLost() {
  const navigate = useNavigate();
  const { user, notify } = useAuth();
  const { addLostItem } = useItems();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    brand: '',
    color: '',
    location: 'Main Library',
    roomDetails: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00 PM',
    description: '',
    reward: '',
    urgency: 'Medium',
    image: '',
    reporterName: user ? user.name : '',
    reporterContact: user ? user.email : '',
    reporterPhone: user ? user.phone : ''
  });

  const [imagePreview, setImagePreview] = useState('');

  const sampleImages = [
    { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
    { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
    { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80' },
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
    { label: 'Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80' }
  ];

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title || !formData.description) {
      setErrorMessage('Please fill out the item title and description.');
      return;
    }

    const finalImage = imagePreview || formData.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
    const finalLocation = formData.roomDetails 
      ? `${formData.location} — ${formData.roomDetails}` 
      : formData.location;

    try {
      setSubmitting(true);
      const created = await addLostItem({
        ...formData,
        image: finalImage,
        location: finalLocation
      });

      notify(`Lost report logged! Tracking code: ${created.referenceCode}`);
      navigate('/lost-items');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit report. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePresetImage = (url) => {
    setImagePreview(url);
    setFormData(prev => ({ ...prev, image: url }));
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="border-b border-[#d0d7de] bg-[#f6f8fa] py-10 md:py-14">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 font-mono text-xs text-[#59636e] uppercase mb-2">
            <span>action.report_lost()</span>
            <span>■</span>
            <span className="text-[#cf222e] font-semibold">Priority Campus Broadcast</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-[#1f2328] uppercase tracking-tight">
            Report a Lost Belonging
          </h1>
          <p className="text-[#59636e] text-sm md:text-base mt-2 max-w-2xl">
            Broadcast details across the campus recovery network. Campus Safety officers and student helpdesks will cross-reference this with incoming found property.
          </p>
        </div>
      </section>

      <PixelBanner />

      {/* Main Form */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <form onSubmit={handleSubmit} className="border border-[#d0d7de] bg-white divide-y divide-[#d0d7de]">
            {/* Step 1: Item Details */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  01 / Item Details & Identification
                </span>
                <span className="font-mono text-xs text-[#59636e]">* Required fields</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    ITEM TITLE / HEADLINE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Space Gray 14-inch MacBook Pro M3"
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
                    <option value="Bags & Backpacks">Bags & Backpacks</option>
                    <option value="IDs & Cards">IDs & Cards</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Books & Supplies">Books & Supplies</option>
                    <option value="Apparel & Clothing">Apparel & Clothing</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    BRAND / MODEL
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple, Sony, North Face, Hydro Flask"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    PRIMARY COLOR
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Matte Black, Navy Blue, Silver"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    URGENCY LEVEL
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    aria-label="Report urgency level"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Needed for exams/classes)</option>
                    <option value="Urgent">Urgent (Car keys, Passport, Critical ID)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    DETAILED DESCRIPTION & DISTINCTIVE MARKS *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe specific scratches, stickers, wallpaper, case color, contents, or distinguishing features..."
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Location & Timing */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  02 / Campus Location & Date
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    CAMPUS BUILDING / ZONE *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    aria-label="Campus building or zone"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans bg-white"
                  >
                    <option value="Main Library">Main University Library</option>
                    <option value="Student Union & Commons">Student Union & Commons</option>
                    <option value="University Dining Hall">University Dining Hall</option>
                    <option value="Engineering Quad">Engineering Quad & Labs</option>
                    <option value="Science Lecture Halls">Science Lecture Complex</option>
                    <option value="Campus Recreation Center">Campus Recreation & Gym</option>
                    <option value="North Parking Structure">North Parking Structure</option>
                    <option value="Campus Shuttle / Bus Stop">Campus Shuttle / Bus Stop</option>
                    <option value="Outdoor Quad & Lawn">Outdoor Quad & Lawn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    SPECIFIC ROOM / DESK / SPOT
                  </label>
                  <input
                    type="text"
                    value={formData.roomDetails}
                    onChange={(e) => setFormData({ ...formData, roomDetails: e.target.value })}
                    placeholder="e.g. 3rd Floor quiet study pod desk 34"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    DATE LAST SEEN *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    APPROXIMATE TIME
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 2:30 PM - 4:00 PM"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Photo / Preset */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  03 / Item Image or Preset
                </span>
                <span className="font-mono text-xs text-[#59636e]">Helps students recognize your item</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-2">
                  SELECT A QUICK PRESET OR PASTE PHOTO URL:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {sampleImages.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => handlePresetImage(s.url)}
                      className={`border p-1.5 flex flex-col items-center gap-1 transition-all ${
                        imagePreview === s.url ? 'border-black ring-2 ring-black' : 'border-[#d0d7de] hover:border-gray-400'
                      }`}
                    >
                      <img src={s.url} alt={s.label} className="w-full h-12 object-cover" />
                      <span className="text-[10px] font-mono text-[#1f2328] truncate">{s.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="Or paste an image URL (https://...)"
                    className="flex-1 px-3.5 py-2 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setFormData({ ...formData, image: '' }); }}
                      className="px-3 py-2 border border-[#d0d7de] text-xs font-mono hover:bg-[#f6f8fa]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-4 p-3 bg-[#f6f8fa] border border-[#d0d7de] flex items-center gap-4">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover border border-[#d0d7de]" />
                    <span className="text-xs font-mono text-[#238636]">✓ Image selected & attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Contact & Reward */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#eaeef2] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#1f2328]">
                  04 / Contact Information & Optional Reward
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    YOUR NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    placeholder="Alex Rivera"
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
                    value={formData.reporterContact}
                    onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                    placeholder="student@campus.edu"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                    REWARD OFFER (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                    placeholder="e.g. $50 Cash or Coffee on me!"
                    className="w-full px-3.5 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 bg-[#ffebe9] border border-[#ff8182] text-[#cf222e] text-xs font-mono">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Submit Bar */}
            <div className="p-6 md:p-8 bg-[#f6f8fa] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#59636e] font-mono">
                BROADCAST TARGET: 14 CAMPUS DESKS & STUDENT FEED
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#238636] hover:bg-[#2ea44f] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>{submitting ? 'Publishing Report...' : 'Publish Lost Item Report'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
