import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: report, error } = await supabase
      .from('validation_reports')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error('/api/validation/[id] GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: report } = await supabase
      .from('validation_reports')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    await supabase.from('validation_reports').delete().eq('id', params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('/api/validation/[id] DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
