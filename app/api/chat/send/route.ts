import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import { chatAgent } from '@/lib/agents/chatAgent';

export async function POST(req: NextRequest) {
  try {
    const { session_id, message, prd_context } = await req.json();

    if (!session_id || !message) {
      return NextResponse.json({ error: 'session_id and message required' }, { status: 400 });
    }

    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id, title')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    // Save user message
    await supabase.from('chat_messages').insert({
      session_id,
      role: 'user',
      content: message,
    });

    // Build messages for agent
    const messages = [
      ...(history ?? []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Get AI response
    const assistantContent = await chatAgent(messages, prd_context);

    // Save assistant message
    const { data: savedMsg } = await supabase
      .from('chat_messages')
      .insert({ session_id, role: 'assistant', content: assistantContent })
      .select()
      .single();

    // Update session updated_at and maybe set title from first message
    const isFirstMessage = !history || history.length === 0;
    const newTitle = isFirstMessage ? message.slice(0, 40) : session.title;

    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString(), title: newTitle })
      .eq('id', session_id);

    return NextResponse.json({ message: savedMsg });
  } catch (err) {
    console.error('/api/chat/send error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
