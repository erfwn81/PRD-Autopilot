import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import { ticketAgent } from '@/lib/agents/ticketAgent';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: prd, error } = await supabase
      .from('prd_documents')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error || !prd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    const prdJson = JSON.stringify(prd, null, 2);
    const tickets = await ticketAgent(prdJson);

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error('/api/prd/breakdown error:', err);
    return NextResponse.json({ error: 'Ticket breakdown failed' }, { status: 500 });
  }
}
