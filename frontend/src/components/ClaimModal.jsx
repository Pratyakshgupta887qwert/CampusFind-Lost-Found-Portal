import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemContext';
import { X, ShieldCheck, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';

export default function ClaimModal({ item, type = 'found', onClose }) {
  const { user, notify } = useAuth();
  const { submitClaim } = useItems();

  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    email: user ? user.email : '',
    studentId: user ? user.studentId : '',
    phone: user ? user.phone : '',
    proofDescription: '',
    serialOrUniqueMark: '',
    agreedToTerms: false
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.proofDescription) {
      alert('Please provide verification proof or description.');
      return;
    }

    if (type === 'found') {
      submitClaim(item.id, {
        claimantName: formData.fullName,
        claimantEmail: formData.email,
        claimantStudentId: formData.studentId,
        claimantPhone: formData.phone,
        proofDescription: formData.proofDescription,
        serialOrUniqueMark: formData.serialOrUniqueMark
      });
      notify(`Claim submitted for "${item.title}". Campus Security will verify your details.`);
    } else {
      notify(`Contact request sent to owner of "${item.title}". Check your email for updates.`);
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#d0d7de] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#d0d7de] px-6 py-4 bg-[#f6f8fa]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 bg-black text-white">
              {type === 'found' ? 'Claim Request' : 'Contact Owner'}
            </span>
            <span className="font-mono text-xs text-[#59636e]">{item.referenceCode}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#59636e] hover:text-black p-1 hover:bg-[#eaeef2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 text-[#238636] flex items-center justify-center mx-auto border border-green-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-display text-[#1f2328]">
              {type === 'found' ? 'Claim Filed Successfully' : 'Owner Contacted'}
            </h3>
            <p className="text-sm text-[#59636e] max-w-md mx-auto leading-relaxed">
              {type === 'found' 
                ? 'Your claim details and ownership verification proof have been transmitted to the custody station holding the item. Bring your student photo ID when collecting.'
                : 'A secure notification has been dispatched to the student who reported this lost item. Keep an eye on your campus email inbox.'}
            </p>
            <div className="p-4 bg-[#f6f8fa] border border-[#d0d7de] text-xs font-mono text-left max-w-md mx-auto">
              <div className="text-[#59636e]">CLAIM TRACKING TICKET</div>
              <div className="font-bold text-[#1f2328] text-sm mt-1">#CLM-UNIV-{Date.now().toString().slice(-6)}</div>
              <div className="mt-2 text-[#59636e]">STATION: {item.custodyLocation || item.location}</div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#238636] text-white font-semibold text-sm hover:bg-[#2ea44f] transition-colors mt-2"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Item preview banner */}
            <div className="flex gap-4 p-3 bg-[#f6f8fa] border border-[#d0d7de] items-center">
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 object-cover border border-[#d0d7de] shrink-0"
              />
              <div className="min-w-0">
                <span className="font-mono text-[11px] text-[#0969da] uppercase font-semibold">
                  {item.category}
                </span>
                <h4 className="font-bold text-[#1f2328] text-sm truncate">{item.title}</h4>
                <p className="text-xs text-[#59636e] truncate">{item.location}</p>
              </div>
            </div>

            {type === 'found' && item.verificationHint && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 font-mono">
                  <Lock className="w-3.5 h-3.5" />
                  <span>SECURITY VERIFICATION QUESTION</span>
                </div>
                <p>{item.verificationHint}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black"
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
                  placeholder="student@campus.edu"
                  className="w-full px-3 py-2 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  STUDENT / EMPLOYEE ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="STU-992026"
                  className="w-full px-3 py-2 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#1f2328] mb-1">
                {type === 'found' ? 'PROOF OF OWNERSHIP / SECRET MARKS *' : 'MESSAGE TO OWNER / HANDOVER PREFERENCE *'}
              </label>
              <textarea
                required
                rows={3}
                value={formData.proofDescription}
                onChange={(e) => setFormData({ ...formData, proofDescription: e.target.value })}
                placeholder={
                  type === 'found'
                    ? 'Describe undisclosed features, wallpapers, stickers, or answer the security prompt above...'
                    : 'Where and when can you meet on campus, or at which security desk did you leave it?'
                }
                className="w-full px-3 py-2 border border-[#d0d7de] text-sm focus:outline-hidden focus:border-black"
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-xs text-[#59636e] leading-tight cursor-pointer">
                I certify that I am providing truthful verification. False claims are reported to the University Dean of Students and Campus Safety.
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d0d7de]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium border border-[#d0d7de] hover:bg-[#f6f8fa] text-[#1f2328]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#238636] hover:bg-[#2ea44f] text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>{type === 'found' ? 'Submit Claim Request' : 'Send Message'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
