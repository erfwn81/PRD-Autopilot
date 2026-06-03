'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import InitialInput from '@/components/interview/InitialInput';

export default function NewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (initialInput: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialInput }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to start interview');
      }

      const { sessionId, question, questionNumber } = await res.json();

      sessionStorage.setItem(
        `prd_q_${sessionId}`,
        JSON.stringify({ question, questionNumber })
      );

      router.push(`/prd/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <InitialInput onSubmit={handleSubmit} loading={loading} />
      </main>
    </div>
  );
}
