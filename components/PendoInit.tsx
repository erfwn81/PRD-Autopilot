'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PendoInit() {
  useEffect(() => {
    pendo.initialize({ visitor: { id: '' } });

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = session.user;
        pendo.identify({
          visitor: {
            id: user.id,
            email: user.email || '',
            full_name: (user.user_metadata?.display_name as string) || '',
            display_name: (user.user_metadata?.display_name as string) || '',
          },
        });
      } else if (event === 'SIGNED_OUT') {
        pendo.clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
