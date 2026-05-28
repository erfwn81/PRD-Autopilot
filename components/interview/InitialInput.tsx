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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe your feature idea</h2>
        <p className="text-gray-500">
          Write 2–3 sentences about what you want to build. Be as specific or vague as you like — our AI will ask the right follow-up questions.
        </p>
      </div>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. I want to add a shared read-only dashboard view that external stakeholders like investors and customers can access without needing to sign up..."
        rows={6}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{input.length} characters (minimum 20)</p>
        <Button onClick={handleSubmit} loading={loading} disabled={input.trim().length < 20} size="lg">
          Start Interview →
        </Button>
      </div>
    </div>
  );
}
