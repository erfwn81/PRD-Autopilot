'use client';

import { useState, useCallback, useRef } from 'react';

interface PRDSectionProps {
  title: string;
  content: string;
  onSave?: (value: string) => Promise<void>;
  renderContent?: (content: string) => React.ReactNode;
}

export default function PRDSection({ title, content, onSave, renderContent }: PRDSectionProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (next: string) => {
      setValue(next);
      if (!onSave) return;
      setSaveState('saving');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        await onSave(next);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      }, 800);
    },
    [onSave]
  );

  return (
    <section className="border-b border-gray-100 py-6 last:border-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {saveState === 'saving' && <span>Saving…</span>}
          {saveState === 'saved' && <span className="text-green-600">Saved ✓</span>}
          {onSave && (
            <button
              onClick={() => setEditing(!editing)}
              className="text-indigo-500 hover:text-indigo-700"
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={8}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed">
          {renderContent ? renderContent(value) : <p className="whitespace-pre-wrap">{value}</p>}
        </div>
      )}
    </section>
  );
}
