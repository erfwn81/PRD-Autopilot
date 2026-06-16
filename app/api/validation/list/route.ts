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
    const { data: reports, error } = await supabase
      .from('validation_reports')
      .select('id, idea_input, verdict, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    return NextResponse.json({ reports: reports ?? [] });
  } catch (err) {
    console.error('/api/validation/list GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
