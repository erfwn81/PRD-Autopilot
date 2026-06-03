'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeletePRDButtonProps {
  sessionId: string;
}

export default function DeletePRDButton({ sessionId }: DeletePRDButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      'Delete this PRD? This cannot be undone.'
    );

    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const res = await fetch('/api/prd/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to delete PRD');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete PRD');
      setDeleting(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}