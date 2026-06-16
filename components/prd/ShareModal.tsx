'use client';

import { useState } from 'react';

interface ShareModalProps {
  shareUrl: string;
  onClose: () => void;
}

export default function ShareModal({ shareUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      style={{ backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: '#12121A',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Share for Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl">×</button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Anyone with this link can view your PRD and leave comments — no account needed.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          />
          <button onClick={handleCopy} className="btn-primary text-sm px-4 py-2 rounded-xl whitespace-nowrap">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <a href={shareUrl} target="_blank" rel="noopener noreferrer"
          className="block text-center text-sm text-primary hover:text-primary-hover transition-colors">
          Open in new tab →
        </a>
      </div>
    </div>
  );
}
