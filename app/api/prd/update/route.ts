import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Plain text sections — saved as strings
const TEXT_SECTIONS = ['problem_statement'] as const;

// Structured sections — must be valid JSON arrays or objects
const STRUCTURED_SECTIONS = [
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

const ALL_SECTIONS = [...TEXT_SECTIONS, ...STRUCTURED_SECTIONS] as const;
type Section = typeof ALL_SECTIONS[number];

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, section, value } = await req.json();

    if (!sessionId || !section || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ALL_SECTIONS.includes(section as Section)) {
      return NextResponse.json(
        { error: `Invalid section: ${section}` },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // For plain text sections — save as string directly
    if (TEXT_SECTIONS.includes(section as typeof TEXT_SECTIONS[number])) {
      const { error } = await supabase
        .from('prd_documents')
        .update({
          [section]: typeof value === 'string' ? value : String(value),
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (error) {
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    // For structured sections — validate it's proper JSON before saving
    // Value should already be an array or object (sent as JSON from frontend)
    if (STRUCTURED_SECTIONS.includes(section as typeof STRUCTURED_SECTIONS[number])) {
      let parsedValue: unknown;

      if (typeof value === 'string') {
        // If frontend sent a string, try to parse it
        try {
          parsedValue = JSON.parse(value);
        } catch {
          return NextResponse.json(
            { error: `Invalid JSON for structured section: ${section}` },
            { status: 400 }
          );
        }
      } else {
        // Already an object/array — use directly
        parsedValue = value;
      }

      // Validate it's an array or object (not a primitive)
      if (typeof parsedValue !== 'object' || parsedValue === null) {
        return NextResponse.json(
          { error: `Section ${section} must be an array or object` },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('prd_documents')
        .update({
          [section]: parsedValue,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('PRD structured update error:', error);
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown section type' }, { status: 400 });
  } catch (err) {
    console.error('/api/prd/update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
