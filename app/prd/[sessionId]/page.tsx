'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import QuestionCard from '@/components/interview/QuestionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const GENERATION_MESSAGES = [
  'Running specialized AI agents...',
  'Agent 1: Analyzing user personas...',
  'Agent 2: Defining the problem...',
  'Agent 3: Writing user stories...',
  'Agent 4: Mapping acceptance criteria...',
  'Agent 5: Building metrics and rollout plan...',
];

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [question, setQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState(GENERATION_MESSAGES[0]);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!generating) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % GENERATION_MESSAGES.length;
      setGenMessage(GENERATION_MESSAGES[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [generating]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`prd_q_${sessionId}`);
    if (stored) {
      const { question: q, questionNumber: n } = JSON.parse(stored);
      setQuestion(q);
      setQuestionNumber(n);
    } else {
      setError('Session not found. Please start a new PRD.');
    }
    setInitialized(true);
  }, [sessionId]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/interview/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, questionNumber, answer }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to save answer');
        }

        const data = await res.json();

        if (data.done) {
          setLoading(false);
          setGenerating(true);
          const genRes = await fetch('/api/prd/generate-swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (!genRes.ok) {
            const errData = await genRes.json();
            throw new Error(errData.error ?? 'PRD generation failed');
          }
          router.push(`/prd/${sessionId}/result`);
        } else {
          sessionStorage.setItem(
            `prd_q_${sessionId}`,
            JSON.stringify({ question: data.question, questionNumber: data.questionNumber })
          );
          setQuestion(data.question);
          setQuestionNumber(data.questionNumber);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setLoading(false);
        setGenerating(false);
      }
    },
    [sessionId, questionNumber, router]
  );

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 bg-grid"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(109,94,245,0.10) 0%, transparent 70%), #0A0A0F` }}>
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-2">Generating your PRD</p>
          <p className="text-sm text-gray-500 animate-pulse">{genMessage}</p>
        </div>
        {/* Agent progress indicators */}
        <div className="flex gap-2 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-pulse-slow"
              style={{ background: '#6D5EF5', animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:py-16">
        {error && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm text-danger"
            style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)' }}>
            {error}
          </div>
        )}
        {question ? (
          <QuestionCard
            question={question}
            questionNumber={questionNumber}
            totalQuestions={5}
            onAnswer={handleAnswer}
            loading={loading}
          />
        ) : (
          <p className="text-gray-500">{error || 'Loading question...'}</p>
        )}
      </main>
    </div>
  );
}
