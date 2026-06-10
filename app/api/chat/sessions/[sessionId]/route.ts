import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { sessionId } = params;

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // C3: Include attachments per message
    const { data: rawMessages } = await supabase
      .from('chat_messages')
      .select(`
        *,
        chat_attachments (id, file_name, mime_type, size_bytes)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    // Normalize chat_attachments → attachments
    const messages = ((rawMessages ?? []) as Array<Record<string, unknown>>).map(
      ({ chat_attachments, ...rest }) => ({
        ...rest,
        attachments: (chat_attachments as unknown[]) ?? [],
      })
    );

    return NextResponse.json({ session, messages });
  } catch (err) {
    console.error('/api/chat/sessions/[sessionId] GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { sessionId } = params;

    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await supabase.from('chat_attachments').delete().eq('session_id', sessionId);
    await supabase.from('chat_messages').delete().eq('session_id', sessionId);
    await supabase.from('chat_sessions').delete().eq('id', sessionId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('/api/chat/sessions/[sessionId] DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
