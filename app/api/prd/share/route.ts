import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://prd-autopilot.vercel.app';

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

    // Check if share already exists
    const { data: existing } = await supabase
      .from('prd_shares')
      .select('share_token')
      .eq('prd_session_id', sessionId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        share_token: existing.share_token,
        share_url: `${APP_URL}/prd/share/${existing.share_token}`,
      });
    }

    const share_token = crypto.randomUUID();

    await supabase.from('prd_shares').insert({
      prd_session_id: sessionId,
      share_token,
      created_by: user.id,
    });

    return NextResponse.json({
      share_token,
      share_url: `${APP_URL}/prd/share/${share_token}`,
    });
  } catch (err) {
    console.error('/api/prd/share error:', err);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}
