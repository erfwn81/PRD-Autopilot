import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateQuestions } from '@/lib/claude/generateQuestions';

export async function POST(req: NextRequest) {
  try {
    const { initialInput } = await req.json();

    if (!initialInput || initialInput.trim().length < 20) {
      return NextResponse.json(
        { error: 'Initial input must be at least 20 characters' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const questions = await generateQuestions(initialInput.trim());

    const title = initialInput.trim().slice(0, 80);

    const { data: session, error: sessionError } = await supabase
      .from('prd_sessions')
      .insert({
        user_id: null,
        title,
        initial_input: initialInput.trim(),
        status: 'interviewing',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session insert error:', sessionError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    const qaRows = questions.map((question, i) => ({
      session_id: session.id,
      question_number: i + 1,
      question,
      answer: null,
    }));

    const { error: qaError } = await supabase.from('interview_qa').insert(qaRows);

    if (qaError) {
      console.error('QA insert error:', qaError);
      return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 });
    }

    return NextResponse.json({
      sessionId: session.id,
      question: questions[0],
      questionNumber: 1,
      totalQuestions: 5,
    });
  } catch (err) {
    console.error('/api/interview/start error:', err);
    return NextResponse.json(
      { error: 'Failed to start interview. Check your OPENAI_API_KEY.' },
      { status: 500 }
    );
  }
}
