import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const UPDATABLE_SECTIONS = [
  'problem_statement',
  'user_personas',
  'jobs_to_be_done',
  'user_stories',
  'acceptance_criteria',
  'edge_cases',
  'out_of_scope',
  'success_metrics',
  'rollout_plan',
  'open_questions',
] as const;

type UpdatableSection = typeof UPDATABLE_SECTIONS[number];

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, section, value } = await req.json();

    if (!sessionId || !section || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!UPDATABLE_SECTIONS.includes(section as UpdatableSection)) {
      return NextResponse.json({ error: `Invalid section: ${section}` }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('prd_documents')
      .update({ [section]: value, updated_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('/api/prd/update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
