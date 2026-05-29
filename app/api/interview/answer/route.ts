import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, questionNumber, answer } = await req.json();

    if (!sessionId || !questionNumber || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (answer.trim().length < 3) {
      return NextResponse.json({ error: 'Answer too short' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error: updateError } = await supabase
      .from('interview_qa')
      .update({ answer: answer.trim() })
      .eq('session_id', sessionId)
      .eq('question_number', questionNumber);

    if (updateError) {
      console.error('Answer update error:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    if (questionNumber >= 5) {
      await supabase
        .from('prd_sessions')
        .update({ status: 'generating', updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return NextResponse.json({ done: true, sessionId });
    }

    const { data: nextQA, error: fetchError } = await supabase
      .from('interview_qa')
      .select('question')
      .eq('session_id', sessionId)
      .eq('question_number', questionNumber + 1)
      .single();

    if (fetchError || !nextQA) {
      return NextResponse.json({ error: 'Failed to fetch next question' }, { status: 500 });
    }

    return NextResponse.json({
      question: nextQA.question,
      questionNumber: questionNumber + 1,
      totalQuestions: 5,
      done: false,
    });
  } catch (err) {
    console.error('/api/interview/answer error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
