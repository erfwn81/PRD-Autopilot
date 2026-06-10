'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NewChatPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login?redirectTo=/chat/new');
        return;
      }
      try {
        const res = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat' }),
        });
        if (!res.ok) throw new Error('Failed to create chat session');
        const { session } = await res.json();
        router.push(`/chat/${session.id}`);
      } catch {
        setError('Failed to create chat. Please try again.');
      }
    });
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-sm">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="text-indigo-600 hover:underline text-sm">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-sm text-gray-500 mt-4">Creating your chat...</p>
      </div>
    </div>
  );
}
