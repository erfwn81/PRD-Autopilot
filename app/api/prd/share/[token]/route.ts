import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const supabase = createServiceClient();

    const { data: share, error } = await supabase
      .from('prd_shares')
      .select('prd_session_id, created_at')
      .eq('share_token', token)
      .maybeSingle();

    if (error || !share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const { data: session } = await supabase
      .from('prd_sessions')
      .select('title, created_at')
      .eq('id', share.prd_session_id)
      .single();

    const { data: prd } = await supabase
      .from('prd_documents')
      .select('*')
      .eq('session_id', share.prd_session_id)
      .single();

    return NextResponse.json({
      prd,
      title: session?.title ?? 'Untitled PRD',
      created_at: session?.created_at ?? share.created_at,
    });
  } catch (err) {
    console.error('/api/prd/share/[token] error:', err);
    return NextResponse.json({ error: 'Failed to fetch shared PRD' }, { status: 500 });
  }
}
