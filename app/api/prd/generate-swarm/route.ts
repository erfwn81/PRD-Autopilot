import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import { personaAgent } from '@/lib/agents/personaAgent';
import { problemAgent } from '@/lib/agents/problemAgent';
import { storiesAgent } from '@/lib/agents/storiesAgent';
import { criteriaAgent } from '@/lib/agents/criteriaAgent';
import { metricsAgent } from '@/lib/agents/metricsAgent';
import { toMarkdown } from '@/lib/export/toMarkdown';
import type { PRDDocument } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Auth check
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

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
      return NextResponse.json({ error: 'Interview not complete' }, { status: 400 });
    }

    const unanswered = qaRows.filter((q) => !q.answer);
    if (unanswered.length > 0) {
      return NextResponse.json({ error: 'Not all questions answered' }, { status: 400 });
    }

    const qaContext = qaRows
      .map((row, i) => `Q${i + 1}: ${row.question}\nA${i + 1}: ${row.answer}`)
      .join('\n\n');

    const initialInput = session.initial_input;

    // Batch 1: run 3 agents in parallel
    const [personas, problem_statement, storiesResult] = await Promise.all([
      personaAgent(initialInput, qaContext),
      problemAgent(initialInput, qaContext),
      storiesAgent(initialInput, qaContext, []),
    ]);

    const { jobs_to_be_done, user_stories } = storiesResult;

    // Batch 2: run 2 agents in parallel (depend on batch 1)
    const [criteriaResult, metricsResult] = await Promise.all([
      criteriaAgent(user_stories, initialInput),
      metricsAgent(initialInput, qaContext, user_stories),
    ]);

    const { acceptance_criteria, edge_cases } = criteriaResult;
    const { success_metrics, out_of_scope, rollout_plan, open_questions } = metricsResult;

    // Parse title from first sentence of problem statement
    const titleRaw = problem_statement.split(/[.\n]/)[0].trim().slice(0, 60);
    const title = titleRaw || session.title || 'Untitled PRD';

    const prdData = {
      problem_statement,
      user_personas: personas,
      jobs_to_be_done,
      user_stories,
      acceptance_criteria,
      edge_cases,
      out_of_scope,
      success_metrics,
      rollout_plan,
      open_questions,
    };

    const prdForMarkdown = {
      ...prdData,
      id: '',
      session_id: sessionId,
      title,
      raw_markdown: null,
      created_at: '',
      updated_at: '',
    } as PRDDocument;
    const raw_markdown = toMarkdown(prdForMarkdown);

    // Check for existing document — update or insert
    const { data: existing } = await supabase
      .from('prd_documents')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    let savedPRD;
    if (existing) {
      const { data } = await supabase
        .from('prd_documents')
        .update({ ...prdData, raw_markdown, updated_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .select()
        .single();
      savedPRD = data;
    } else {
      const { data } = await supabase
        .from('prd_documents')
        .insert({ session_id: sessionId, ...prdData, raw_markdown })
        .select()
        .single();
      savedPRD = data;
    }

    await supabase
      .from('prd_sessions')
      .update({ title, status: 'complete', updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return NextResponse.json({ success: true, prd: { ...savedPRD, title } });
  } catch (err) {
    console.error('/api/prd/generate-swarm error:', err);
    return NextResponse.json({ error: 'Multi-agent generation failed' }, { status: 500 });
  }
}
