import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ArrowUpRight, 
  Sparkles,
  AlertTriangle,
  Plus
} from 'lucide-react';
import ClaimModal from '../components/ClaimModal';
import PixelBanner from '../components/PixelBanner';

export default function LostItems() {
  const { lostItems } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const categories = [
    'All',
    'Electronics',
    'Keys & Wallets',
    'Bags & Backpacks',
    'IDs & Cards',
    'Accessories',
    'Books & Supplies'
  ];

  const locations = [
    'All',
    'Main Library',
    'Student Union',
    'University Dining Commons',
    'Engineering Building',
    'Campus Recreation Center',
    'Science Lecture Hall',
    'North Campus Parking'
  ];

  const filteredItems = useMemo(() => {
    return lostItems
      .filter((item) => {
        const matchesSearch = 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = 
          selectedCategory === 'All' || item.category === selectedCategory;

        const matchesLocation = 
          selectedLocation === 'All' || item.location.toLowerCase().includes(selectedLocation.toLowerCase());

        return matchesSearch && matchesCategory && matchesLocation;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
        return 0;
      });
  }, [lostItems, searchQuery, selectedCategory, selectedLocation, sortBy]);

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header - Universe Style */}
      <section className="border-b border-[#d0d7de] bg-[#f6f8fa] py-10 md:py-14">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[#59636e] uppercase mb-2">
                <span>registry.lost_items()</span>
                <span>■</span>
                <span className="text-[#cf222e] font-semibold">{filteredItems.length} Active Reports</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-[#1f2328] tracking-tight uppercase">
                Lost Items Registry
              </h1>
              <p className="text-[#59636e] text-sm md:text-base max-w-2xl mt-2">
                Search missing possessions across all campus buildings, lecture halls, and transit spots. If you spotted an item, contact the owner or turn it into a campus desk.
              </p>
            </div>

            <Link
              to="/report-lost"
              className="px-6 py-3.5 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-sm flex items-center gap-2 self-start md:self-auto transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Report Your Lost Item</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <PixelBanner />

      {/* Filter and Search Bar */}
      <section className="border-b border-[#d0d7de] sticky top-14 md:top-16 z-30 bg-white shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#59636e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, building, or reference ID (e.g. MacBook, CF-LST-9021)..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
              />
            </div>

            {/* Location selector */}
            <div className="w-full lg:w-60">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter by campus location"
                className="w-full py-2.5 px-3 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-mono text-xs bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'All' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort selector */}
            <div className="w-full lg:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort lost items by date"
                className="w-full py-2.5 px-3 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-mono text-xs bg-white"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            <span className="font-mono text-xs text-[#59636e] shrink-0 mr-1">FILTER:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-mono tracking-tight shrink-0 border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-white text-[#59636e] border-[#d0d7de] hover:border-black hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          {filteredItems.length === 0 ? (
            <div className="border border-[#d0d7de] p-12 text-center bg-[#f6f8fa] max-w-lg mx-auto space-y-4">
              <div className="font-mono text-xs text-[#59636e]">0 RESULTS FOUND</div>
              <h3 className="text-xl font-bold font-display text-[#1f2328]">
                No matching lost reports found
              </h3>
              <p className="text-sm text-[#59636e]">
                Try adjusting your search query, choosing a different category, or report your lost item to the campus registry.
              </p>
              <div className="pt-2">
                <Link
                  to="/report-lost"
                  className="px-6 py-2.5 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-xs font-mono inline-flex items-center gap-1.5"
                >
                  <span>Report Lost Item Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-[#d0d7de] bg-white flex flex-col justify-between hover:border-black transition-all group shadow-2xs"
                >
                  <div>
                    {/* Image Header with Tags */}
                    <div className="relative aspect-16/10 overflow-hidden bg-[#f6f8fa] border-b border-[#d0d7de]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-black text-white">
                          LOST
                        </span>
                        {item.reward && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]">
                            {item.reward}
                          </span>
                        )}
                        {item.urgency === 'Urgent' && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 border border-red-300">
                            URGENT
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs px-2 py-0.5 font-mono text-[11px] text-white">
                        {item.status}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#59636e]">
                        <span className="text-[#0969da] uppercase font-semibold">{item.category}</span>
                        <span>{item.date} • {item.time}</span>
                      </div>

                      <h3 className="font-bold text-lg text-[#1f2328] group-hover:text-[#0969da] transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#59636e] line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="pt-2 border-t border-[#eaeef2] space-y-1.5 text-xs text-[#59636e]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#cf222e] shrink-0" />
                          <span className="font-medium text-[#1f2328] truncate">{item.location}</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#59636e]">
                          Reporter: {item.reporterName} ({item.reporterContact.split('@')[0]}@...)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="border-t border-[#d0d7de] p-4 bg-[#f6f8fa] flex items-center justify-between">
                    <span className="font-mono text-xs text-[#59636e]">{item.referenceCode}</span>
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea44f] text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>I Found This</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Claim Modal */}
      {activeModalItem && (
        <ClaimModal
          item={activeModalItem}
          type="lost"
          onClose={() => setActiveModalItem(null)}
        />
      )}
    </div>
  );
}
