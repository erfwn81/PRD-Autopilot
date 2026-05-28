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

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  loading,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim().length < 5) return;
    onAnswer(answer.trim());
    setAnswer('');
  };

  return (
    <div className="flex flex-col gap-6">
      <InterviewProgress current={questionNumber} total={totalQuestions} />
      <div>
        <p className="text-sm font-medium text-indigo-600 mb-2">Clarifying question</p>
        <p className="text-xl font-semibold text-gray-900 leading-relaxed">{question}</p>
      </div>
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">⌘ + Enter to submit</p>
        <Button onClick={handleSubmit} loading={loading} disabled={answer.trim().length < 5}>
          {questionNumber === totalQuestions ? 'Generate PRD →' : 'Next Question →'}
        </Button>
      </div>
    </div>
  );
}
