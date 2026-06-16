import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import { slideAgent } from '@/lib/agents/pitch/slideAgent';

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { idea, prd_session_id, validation_id } = body as {
      idea?: string;
      prd_session_id?: string;
      validation_id?: string;
    };

    if (!idea && !prd_session_id) {
      return NextResponse.json(
        { error: 'At least one of idea or prd_session_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    let finalIdea = idea?.trim() ?? '';
    let prdContext: string | undefined;
    let validationContext: string | undefined;

    if (prd_session_id) {
      const { data: session } = await supabase
        .from('prd_sessions')
        .select('initial_input, title')
        .eq('id', prd_session_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (session) {
        if (!finalIdea) finalIdea = session.initial_input ?? session.title ?? '';

        const { data: doc } = await supabase
          .from('prd_documents')
          .select('problem_statement, user_stories, success_metrics')
          .eq('session_id', prd_session_id)
          .maybeSingle();

        if (doc) {
          const parts: string[] = [];
          if (doc.problem_statement) parts.push(`Problem: ${doc.problem_statement}`);
          if (Array.isArray(doc.user_stories) && doc.user_stories.length > 0) {
            const stories = (doc.user_stories as Array<{ story: string }>)
              .slice(0, 3)
              .map((s) => `- ${s.story}`)
              .join('\n');
            parts.push(`Key user stories:\n${stories}`);
          }
          if (Array.isArray(doc.success_metrics) && doc.success_metrics.length > 0) {
            const metrics = (doc.success_metrics as Array<{ metric: string; target: string }>)
              .slice(0, 3)
              .map((m) => `- ${m.metric}: ${m.target}`)
              .join('\n');
            parts.push(`Success metrics:\n${metrics}`);
          }
          if (parts.length > 0) prdContext = parts.join('\n\n');
        }
      }
    }

    if (validation_id) {
      const { data: report } = await supabase
        .from('validation_reports')
        .select('market_size, verdict, idea_input')
        .eq('id', validation_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (report) {
        if (!finalIdea && report.idea_input) finalIdea = report.idea_input;
        const parts: string[] = [];
        if (report.market_size && !('error' in (report.market_size as object))) {
          const m = report.market_size as { tam?: string; summary?: string };
          if (m.summary) parts.push(`Market: ${m.summary}`);
          if (m.tam) parts.push(`TAM: ${m.tam}`);
        }
        if (report.verdict && !('error' in (report.verdict as object))) {
          const v = report.verdict as { score?: number; rationale?: string; recommendation?: string };
          if (v.score !== undefined) parts.push(`Validation score: ${v.score}/100`);
          if (v.recommendation) parts.push(`Recommendation: ${v.recommendation}`);
          if (v.rationale) parts.push(`Rationale: ${v.rationale}`);
        }
        if (parts.length > 0) validationContext = parts.join('\n');
      }
    }

    if (!finalIdea) {
      return NextResponse.json({ error: 'Could not determine idea from provided inputs' }, { status: 400 });
    }

    const deck = await slideAgent(finalIdea, prdContext, validationContext);

    const { data: saved, error: saveError } = await supabase
      .from('pitch_decks')
      .insert({
        user_id: user.id,
        prd_session_id: prd_session_id ?? null,
        validation_id: validation_id ?? null,
        title: deck.title,
        slides: deck.slides,
      })
      .select()
      .single();

    if (saveError || !saved) {
      console.error('pitch_decks insert error:', saveError);
      return NextResponse.json({ error: 'Failed to save pitch deck' }, { status: 500 });
    }

    return NextResponse.json({ deck_id: saved.id, deck: saved });
  } catch (err) {
    console.error('/api/pitch/generate error:', err);
    return NextResponse.json({ error: 'Pitch deck generation failed' }, { status: 500 });
  }
}
