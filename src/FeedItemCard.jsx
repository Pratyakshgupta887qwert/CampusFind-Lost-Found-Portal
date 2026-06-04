import React, { useState } from 'react';
import ApprovalActionBox from './ApprovalActionBox';

const statusLabels = {
  open: 'OPEN',
  pending_return: 'WAITING APPROVAL',
  returned: 'COMPLETED',
  expired: 'EXPIRED',
  request_expired: 'REQUEST EXPIRED',
};

const FeedItemCard = ({ item, currentUser, matches, onFound, onClaimFound, onApprove, onReject }) => {
  const isLost = item.type === 'lost';
  const accentColor = isLost ? 'bg-[#e3008c]' : 'bg-[#7fba00]';
  const textColor = isLost ? 'text-[#e3008c]' : 'text-[#7fba00]';
  const isOwner = item.ownerEmail === currentUser.email;
  const isFinder = item.finderEmail === currentUser.email;
  const [returnLoc, setReturnLoc] = useState('');
  const [showLocInput, setShowLocInput] = useState(false);
  const [claimLocation, setClaimLocation] = useState('');
  const [showClaimInput, setShowClaimInput] = useState(false);

  const displayName = item.owner?.name || item.finder?.name || item.claimant?.name || 'Campus user';
  const canFoundLostItem = item.displayStatus === 'open' && isLost && !isOwner;
  const canClaimFoundPost = item.displayStatus === 'open' && !isLost && !isFinder;
  const canApprove = item.displayStatus === 'pending_return' && item.returnRequest?.requestedTo?.email === currentUser.email;
  const waitingForOwner = item.displayStatus === 'pending_return' && !canApprove;

  const handleFoundSubmit = () => {
    if (returnLoc.trim()) {
      onFound(item.id, returnLoc.trim());
      setReturnLoc('');
      setShowLocInput(false);
    }
  };

  const handleClaimSubmit = () => {
    if (claimLocation.trim()) {
      onClaimFound(item.id, claimLocation.trim());
      setClaimLocation('');
      setShowClaimInput(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden border bg-[#0a0a0a] p-5 transition-colors hover:border-zinc-500 ${
        item.displayStatus === 'returned' || item.displayStatus === 'expired'
          ? 'border-zinc-800 opacity-70'
          : 'border-zinc-700'
      }`}
    >
      <div className={`absolute bottom-0 left-0 top-0 w-1 ${accentColor}`}></div>

      <div className="ml-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className={`border border-zinc-800 bg-black px-2 py-1 text-xs font-bold uppercase tracking-wider ${textColor}`}>
              {item.type}
            </span>
            <span className="font-mono text-xs text-zinc-500">{item.time}</span>
            <span className="bg-black px-2 py-1 text-xs font-bold text-[#ffb900]">
              {statusLabels[item.displayStatus] || item.displayStatus}
            </span>
          </div>
          <h3
            className={`mb-1 text-xl font-bold ${
              item.displayStatus === 'returned' ? 'text-zinc-500 line-through' : 'text-white'
            }`}
          >
            {item.title}
          </h3>
          <p className="mb-2 text-sm text-zinc-400">Location: {item.location}</p>
          {item.eventDate && (
            <p className="mb-2 text-xs font-mono text-zinc-500">
              Date/time: {new Date(item.eventDate).toLocaleString()}
            </p>
          )}
          {item.description && <p className="max-w-2xl text-sm text-zinc-500">{item.description}</p>}
        </div>

        <div className="shrink-0 text-left md:text-right">
          <div className="mb-1 text-xs text-zinc-500">Posted by</div>
          <div className="font-mono text-sm text-zinc-300">
            {displayName === currentUser.name ? 'You' : displayName}
          </div>
          {item.finder?.name && isLost && (
            <div className="mt-2 text-xs text-[#7fba00]">
              Finder: {item.finder.email === currentUser.email ? 'You' : item.finder.name}
            </div>
          )}
        </div>
      </div>

      {matches.length > 0 && item.displayStatus === 'open' && (
        <div className="ml-2 mt-4 border border-[#00a4ef]/30 bg-[#00a4ef]/5 p-3">
          <div className="mb-2 font-mono text-xs text-[#00a4ef]">MATCHING SUGGESTIONS</div>
          <div className="space-y-1">
            {matches.map((match) => (
              <div key={match.id} className="text-xs text-zinc-300">
                Possible match: <span className="text-white">{match.title}</span> at {match.location}
              </div>
            ))}
          </div>
        </div>
      )}

      {item.displayStatus !== 'returned' && item.displayStatus !== 'expired' && (
        <div className="ml-2 mt-4 border-t border-zinc-800 pt-4">
          {canFoundLostItem && !showLocInput && (
            <button
              onClick={() => setShowLocInput(true)}
              className="border border-[#00a4ef] px-4 py-2 text-sm font-bold text-[#00a4ef] transition-colors hover:bg-[#00a4ef]/10"
            >
              I Found This Item
            </button>
          )}

          {showLocInput && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={returnLoc}
                onChange={(event) => setReturnLoc(event.target.value)}
                placeholder="Where can the owner collect it?"
                className="flex-1 border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
              />
              <button onClick={handleFoundSubmit} className="bg-[#00a4ef] px-4 py-2 text-sm font-bold text-black">
                Request Return
              </button>
            </div>
          )}

          {canClaimFoundPost && !showClaimInput && (
            <button
              onClick={() => setShowClaimInput(true)}
              className="border border-[#ffb900] px-4 py-2 text-sm font-bold text-[#ffb900] transition-colors hover:bg-[#ffb900]/10"
            >
              This Item Is Mine
            </button>
          )}

          {showClaimInput && (
            <div className="space-y-2">
              <div className="border border-[#f25022]/30 bg-[#f25022]/10 p-3 text-xs text-[#f25022]">
                Claim noted. The finder still cannot hand over the item until you approve the return request.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={claimLocation}
                  onChange={(event) => setClaimLocation(event.target.value)}
                  placeholder="Collection point shared by finder"
                  className="flex-1 border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
                />
                <button onClick={handleClaimSubmit} className="bg-[#ffb900] px-4 py-2 text-sm font-bold text-black">
                  Send Approval Request
                </button>
              </div>
            </div>
          )}

          {canApprove && (
            <ApprovalActionBox
              finderName={item.returnRequest.requestedBy?.name}
              returnLocation={item.returnRequest.location}
              expiresAt={item.returnRequest.expiresAt}
              onApprove={() => onApprove(item.id)}
              onReject={() => onReject(item.id)}
            />
          )}

          {waitingForOwner && (
            <div className="inline-block border border-[#f25022]/30 bg-[#f25022]/10 px-3 py-2 text-sm font-bold text-[#f25022]">
              Return request sent. Waiting for owner approval before handover.
            </div>
          )}

          {item.displayStatus === 'request_expired' && (
            <div className="inline-block border border-zinc-700 px-3 py-2 text-sm text-zinc-400">
              Return request expired. The case is open again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedItemCard;
