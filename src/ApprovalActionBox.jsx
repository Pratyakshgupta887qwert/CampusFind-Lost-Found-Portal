import React from 'react';

const ApprovalActionBox = ({ finderName, returnLocation, expiresAt, onApprove, onReject }) => {
  return (
    <div className="relative mt-2 border border-[#f25022] bg-[#f25022]/5 p-4">
      <div className="absolute -top-3 left-4 bg-black px-2 font-mono text-xs font-bold tracking-widest text-[#f25022]">
        ACTION REQUIRED
      </div>

      <p className="mb-2 mt-2 text-sm text-zinc-300">
        <strong className="text-white">{finderName}</strong> has requested to return this item to you.
        Collection point: <span className="font-bold text-[#00a4ef]">{returnLocation}</span>.
      </p>

      {expiresAt && (
        <p className="mb-4 font-mono text-xs text-zinc-500">
          Request expires: {new Date(expiresAt).toLocaleString()}
        </p>
      )}

      <div className="mb-4 border border-zinc-800 border-l-[#ffb900] bg-black p-3 text-xs text-zinc-400">
        <strong className="text-[#ffb900]">GOLDEN RULE:</strong> Verify this is your item before approving.
        Approving will authorize the handover and close this case permanently.
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={onApprove}
          className="flex flex-1 items-center justify-center gap-2 bg-[#7fba00] py-2 font-bold text-black transition-colors hover:bg-[#8bd100]"
        >
          <span>OK</span> Approve Return
        </button>
        <button
          onClick={onReject}
          className="flex flex-1 items-center justify-center gap-2 border border-zinc-700 py-2 font-bold text-zinc-400 transition-colors hover:border-[#f25022] hover:text-[#f25022]"
        >
          <span>X</span> Reject (Not Mine)
        </button>
      </div>
    </div>
  );
};

export default ApprovalActionBox;
