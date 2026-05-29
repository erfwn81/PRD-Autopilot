import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generatePRD } from '@/lib/claude/generatePRD';
import { toMarkdown } from '@/lib/export/toMarkdown';
import type { PRDDocument } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('prd_documents')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existing) {
      const { data: session } = await supabase
        .from('prd_sessions')
        .select('title')
        .eq('id', sessionId)
        .single();
      return NextResponse.json({ prd: { ...existing, title: session?.title ?? 'Untitled PRD' } });
    }

    const { data: session, error: sessionError } = await supabase
      .from('prd_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { data: qaRows, error: qaError } = await supabase
      .from('interview_qa')
      .select('question, answer')
      .eq('session_id', sessionId)
      .order('question_number', { ascending: true });

    if (qaError || !qaRows || qaRows.length < 5) {
      return NextResponse.json(
        { error: 'Interview not complete — need all 5 answers' },
        { status: 400 }
      );
    }

    const unanswered = qaRows.filter((q) => !q.answer);
    if (unanswered.length > 0) {
      return NextResponse.json({ error: 'Not all questions answered' }, { status: 400 });
    }

    const qa = qaRows.map((row) => ({
      question: row.question,
      answer: row.answer as string,
    }));

    const prdData = await generatePRD(session.initial_input, qa) as Record<string, unknown>;

    const prdForMarkdown = {
      ...prdData,
      id: '',
      session_id: sessionId,
      created_at: '',
      updated_at: '',
    } as PRDDocument;
    const rawMarkdown = toMarkdown(prdForMarkdown);

    const { data: savedPRD, error: saveError } = await supabase
      .from('prd_documents')
      .insert({
        session_id: sessionId,
        problem_statement: prdData.problem_statement ?? null,
        user_personas: prdData.user_personas ?? null,
        jobs_to_be_done: prdData.jobs_to_be_done ?? null,
        user_stories: prdData.user_stories ?? null,
        acceptance_criteria: prdData.acceptance_criteria ?? null,
        edge_cases: prdData.edge_cases ?? null,
        out_of_scope: prdData.out_of_scope ?? null,
        success_metrics: prdData.success_metrics ?? null,
        rollout_plan: prdData.rollout_plan ?? null,
        open_questions: prdData.open_questions ?? null,
        raw_markdown: rawMarkdown,
      })
      .select()
      .single();

    if (saveError) {
      console.error('PRD save error:', saveError);
      return NextResponse.json({ error: 'Failed to save PRD' }, { status: 500 });
    }

    await supabase
      .from('prd_sessions')
      .update({
        title: (prdData.title as string) ?? session.title,
        status: 'complete',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    return NextResponse.json({
      prd: { ...savedPRD, title: prdData.title ?? 'Untitled PRD' },
    });
  } catch (err) {
    console.error('/api/prd/generate error:', err);
    return NextResponse.json(
      { error: 'PRD generation failed. Check your OPENAI_API_KEY.' },
      { status: 500 }
    );
  }
}
