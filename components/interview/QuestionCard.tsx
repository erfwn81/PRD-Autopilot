'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import InterviewProgress from './InterviewProgress';

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  loading?: boolean;
}

export default function QuestionCard({ question, questionNumber, totalQuestions, onAnswer, loading }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim().length < 5) return;
    onAnswer(answer.trim());
    setAnswer('');
  };

  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(109,94,245,0.25)',
        boxShadow: '0 0 40px rgba(109,94,245,0.08)',
      }}
    >
      <div className="mb-6">
        <InterviewProgress current={questionNumber} total={totalQuestions} />
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Clarifying question
        </p>
        <p className="text-lg font-medium text-white leading-relaxed">{question}</p>
      </div>

      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here…"
        rows={4}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />

      <div className="flex items-center justify-between mt-5">
        <p className="text-xs text-gray-600">⌘ + Enter to submit</p>
        <Button onClick={handleSubmit} loading={loading} disabled={answer.trim().length < 5}>
          {questionNumber === totalQuestions ? 'Generate PRD →' : 'Next Question →'}
        </Button>
      </div>
    </div>
  );
}
