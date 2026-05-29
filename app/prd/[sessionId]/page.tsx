'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import QuestionCard from '@/components/interview/QuestionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const GENERATION_MESSAGES = [
  'Defining the problem space...',
  'Building user personas...',
  'Writing user stories...',
  'Mapping acceptance criteria...',
  'Drafting your rollout plan...',
  'Finalising the PRD...',
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
          const genRes = await fetch('/api/prd/generate', {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <LoadingSpinner />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">Generating your PRD</p>
          <p className="text-gray-500 text-sm animate-pulse">{genMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
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
