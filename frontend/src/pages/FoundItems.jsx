import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  ArrowUpRight, 
  Plus,
  Building,
  CheckCircle2
} from 'lucide-react';
import ClaimModal from '../components/ClaimModal';
import PixelBanner from '../components/PixelBanner';

export default function FoundItems() {
  const { foundItems } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustody, setSelectedCustody] = useState('All');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const categories = [
    'All',
    'Electronics',
    'Keys & Wallets',
    'Accessories',
    'Books & Supplies',
    'IDs & Cards'
  ];

  const custodyStations = [
    'All',
    'Main Campus Safety HQ',
    'Student Union Info Desk',
    'Main Library Helpdesk',
    'Math Dept Secretary Office',
    'Kept by Student Finder'
  ];

  const filteredItems = useMemo(() => {
    return foundItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.custodyLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesCustody =
        selectedCustody === 'All' || item.custodyLocation.toLowerCase().includes(selectedCustody.toLowerCase());

      return matchesSearch && matchesCategory && matchesCustody;
    });
  }, [foundItems, searchQuery, selectedCategory, selectedCustody]);

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <section className="border-b border-[#d0d7de] bg-[#f6f8fa] py-10 md:py-14">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[#59636e] uppercase mb-2">
                <span>custody.found_property()</span>
                <span>■</span>
                <span className="text-[#238636] font-semibold">{filteredItems.length} Logged Items in Safe Hold</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-[#1f2328] tracking-tight uppercase">
                Found Items Registry
              </h1>
              <p className="text-[#59636e] text-sm md:text-base max-w-2xl mt-2">
                All items turned in to campus safety, library helpdesks, and department offices. Review items currently in custody and submit an official claim verification.
              </p>
            </div>

            <Link
              to="/report-found"
              className="px-6 py-3.5 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-sm flex items-center gap-2 self-start md:self-auto transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log a Found Item</span>
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
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#59636e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search found property, custody desk, color, brand, or reference code..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-sans"
              />
            </div>

            {/* Custody Station dropdown */}
            <div className="w-full lg:w-72">
              <select
                value={selectedCustody}
                onChange={(e) => setSelectedCustody(e.target.value)}
                aria-label="Filter by holding station"
                className="w-full py-2.5 px-3 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black font-mono text-xs bg-white"
              >
                {custodyStations.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Holding Stations' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            <span className="font-mono text-xs text-[#59636e] shrink-0 mr-1">CATEGORY:</span>
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

      {/* Found Items Grid */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          {filteredItems.length === 0 ? (
            <div className="border border-[#d0d7de] p-12 text-center bg-[#f6f8fa] max-w-lg mx-auto space-y-4">
              <div className="font-mono text-xs text-[#59636e]">0 RESULTS FOUND</div>
              <h3 className="text-xl font-bold font-display text-[#1f2328]">
                No found property matching criteria
              </h3>
              <p className="text-sm text-[#59636e]">
                If your item isn't listed here yet, make sure to post a lost item report so our automated matching system can alert you when it's turned in.
              </p>
              <div className="pt-2">
                <Link
                  to="/report-lost"
                  className="px-6 py-2.5 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold text-xs font-mono inline-flex items-center gap-1.5"
                >
                  <span>Post Lost Item Alert</span>
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
                        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-[#238636] text-white">
                          FOUND PROPERTY
                        </span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-white/95 text-[#1f2328] border border-[#d0d7de]">
                          {item.status}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 text-white flex items-center justify-between text-[11px] font-mono">
                        <span className="truncate">Held at: {item.custodyLocation}</span>
                      </div>
                    </div>

                    {/* Content */}
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

                      <div className="pt-2 border-t border-[#eaeef2] space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-[#59636e]">
                          <MapPin className="w-3.5 h-3.5 text-[#cf222e] shrink-0" />
                          <span className="truncate">Found at: <strong className="text-[#1f2328]">{item.location}</strong></span>
                        </div>

                        {item.verificationHint && (
                          <div className="p-2.5 bg-[#f6f8fa] border border-[#d0d7de] text-[11px] text-[#59636e] space-y-0.5">
                            <span className="font-mono font-semibold text-[#1f2328] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-[#238636]" /> Verification Hint:
                            </span>
                            <p className="line-clamp-2">{item.verificationHint}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="border-t border-[#d0d7de] p-4 bg-[#f6f8fa] flex items-center justify-between">
                    <span className="font-mono text-xs text-[#59636e]">{item.referenceCode}</span>
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="px-4 py-2 bg-black hover:bg-[#238636] text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Claim This Item</span>
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
          type="found"
          onClose={() => setActiveModalItem(null)}
        />
      )}
    </div>
  );
}
