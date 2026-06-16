'use client';

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatView from '@/components/chat/ChatView';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login');
    });
  }, [router]);

  const handleSessionCreated = useCallback((newId: string) => {
    // Refresh sidebar so the new session appears
    setRefreshKey(k => k + 1);
    // Navigation is handled by ChatView via router.replace
    void newId;
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <ChatSidebar
        activeSessionId={sessionId}
        refreshKey={refreshKey}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <ChatView
          sessionId={sessionId}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          onSessionCreated={handleSessionCreated}
        />
      </main>
    </div>
  );
}
