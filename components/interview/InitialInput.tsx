'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

interface InitialInputProps {
  onSubmit: (input: string) => void;
  loading?: boolean;
}

export default function InitialInput({ onSubmit, loading }: InitialInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim().length < 20) return;
    onSubmit(input.trim());
  };

  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">New PRD</p>
        <h2 className="text-2xl font-bold text-white mb-2">Describe your feature idea</h2>
        <p className="text-sm text-gray-500">
          Write 2–3 sentences about what you want to build. Be as specific or vague as you like — our AI will ask the right follow-up questions.
        </p>
      </div>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. I want to add a shared read-only dashboard view that external stakeholders like investors and customers can access without needing to sign up..."
        rows={6}
      />

      <div className="flex items-center justify-between mt-5">
        <p className={`text-xs transition-colors ${input.length >= 20 ? 'text-success' : 'text-gray-600'}`}>
          {input.length} characters (minimum 20)
        </p>
        <Button onClick={handleSubmit} loading={loading} disabled={input.trim().length < 20} size="lg">
          Start Interview →
        </Button>
      </div>
    </div>
  );
}
