import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        chat_messages (content, role, created_at)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
    }

    // B2: Only return sessions that have at least one message
    const sessionsWithPreview = (sessions ?? [])
      .filter((s: Record<string, unknown>) => {
        const msgs = s.chat_messages as unknown[];
        return Array.isArray(msgs) && msgs.length > 0;
      })
      .map((s: Record<string, unknown>) => {
        const messages = (s.chat_messages as Array<{ content: string; role: string; created_at: string }>) ?? [];
        const last = messages.sort((a, b) => a.created_at.localeCompare(b.created_at)).at(-1);
        return {
          ...s,
          chat_messages: undefined,
          last_message: last ? last.content.slice(0, 60) : undefined,
        };
      });

    return NextResponse.json({ sessions: sessionsWithPreview });
  } catch (err) {
    console.error('/api/chat/sessions GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = (body.title as string | undefined) || 'New Chat';

    const supabase = createServiceClient();

    // B3: Delete empty sessions older than 1 hour (best-effort cleanup)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: oldSessions } = await supabase
      .from('chat_sessions')
      .select(`id, chat_messages(session_id)`)
      .eq('user_id', user.id)
      .lt('created_at', oneHourAgo);

    const emptyIds = ((oldSessions ?? []) as Array<{ id: string; chat_messages: unknown[] }>)
      .filter(s => !s.chat_messages || s.chat_messages.length === 0)
      .map(s => s.id);

    if (emptyIds.length > 0) {
      await supabase.from('chat_sessions').delete().in('id', emptyIds);
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (err) {
    console.error('/api/chat/sessions POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
