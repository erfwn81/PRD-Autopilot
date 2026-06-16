import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: decks, error } = await supabase
      .from('pitch_decks')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
    }

    return NextResponse.json({ decks: decks ?? [] });
  } catch (err) {
    console.error('/api/pitch/list GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
