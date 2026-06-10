import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import { scoringAgent } from '@/lib/agents/scoringAgent';

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

    const { data: prdDoc, error } = await supabase
      .from('prd_documents')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error || !prdDoc) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    const prdJson = JSON.stringify(prdDoc, null, 2);
    const score = await scoringAgent(prdJson);

    return NextResponse.json({ score });
  } catch (err) {
    console.error('/api/prd/score error:', err);
    return NextResponse.json({ error: 'Scoring failed', details: String(err) }, { status: 500 });
  }
}
