'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatView from '@/components/chat/ChatView';

export default function NewChatPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login?redirectTo=/chat/new');
    });
  }, [router]);

  // D4: When ChatView creates a new session on first send, refresh sidebar
  const handleSessionCreated = useCallback(() => {
    setRefreshKey(k => k + 1);
    // ChatView handles the router.replace('/chat/id') itself
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <ChatSidebar
        activeSessionId={undefined}
        refreshKey={refreshKey}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <ChatView
          sessionId={undefined}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          onSessionCreated={handleSessionCreated}
        />
      </main>
    </div>
  );
}
