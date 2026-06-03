'use client';

import { useState, useRef, useCallback } from 'react';

interface PRDSectionProps {
  title: string;
  content: string;
  renderContent?: () => React.ReactNode;
  onSave?: (value: string) => Promise<void>;
  sectionType?: 'text' | 'personas' | 'jtbd' | 'stories' | 'criteria' |
                'edge_cases' | 'out_of_scope' | 'metrics' | 'rollout' | 'questions';
  structuredValue?: unknown;
  onStructuredSave?: (value: unknown) => Promise<void>;
}

export default function PRDSection({
  title,
  content,
  renderContent,
  onSave,
  sectionType = 'text',
  structuredValue,
  onStructuredSave,
}: PRDSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [textValue, setTextValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Plain text save (problem_statement only)
  const handleTextSave = useCallback(async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(textValue);
      showSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [onSave, textValue]);

  const isStructured = sectionType !== 'text';
  const canEdit = sectionType === 'text' ? !!onSave : !!onStructuredSave;

  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-600 font-medium">Saved ✓</span>
          )}
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div>
          {/* Plain text editing — only for problem_statement */}
          {sectionType === 'text' && (
            <div>
              <textarea
                ref={textareaRef}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-y"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleTextSave}
                  disabled={saving}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setTextValue(content); }}
                  className="text-xs text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Structured editing forms */}
          {isStructured && (
            <StructuredEditor
              sectionType={sectionType}
              value={structuredValue}
              onSave={async (newValue) => {
                if (!onStructuredSave) return;
                setSaving(true);
                try {
                  await onStructuredSave(newValue);
                  showSaved();
                  setEditing(false);
                } finally {
                  setSaving(false);
                }
              }}
              onCancel={() => setEditing(false)}
              saving={saving}
            />
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-700">
          {renderContent ? renderContent() : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Structured editor dispatcher ──────────────────────────────────────────────

interface StructuredEditorProps {
  sectionType: string;
  value: unknown;
  onSave: (value: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function StructuredEditor({ sectionType, value, onSave, onCancel, saving }: StructuredEditorProps) {
  switch (sectionType) {
    case 'jtbd':
    case 'out_of_scope':
      return <StringArrayEditor value={value as string[]} onSave={onSave} onCancel={onCancel} saving={saving} />;
    case 'personas':
      return <PersonasEditor value={value as PersonaItem[]} onSave={onSave} onCancel={onCancel} saving={saving} />;
    case 'stories':
      return <StoriesEditor value={value as StoryItem[]} onSave={onSave} onCancel={onCancel} saving={saving} />;
    case 'criteria':
      return <CriteriaEditor value={value as CriteriaItem[]} onSave={onSave} onCancel={onCancel} saving={saving} />;
    case 'edge_cases':
      return <EdgeCasesEditor value={value as EdgeCaseItem[]} onSave={onSave} onCancel={onCancel} saving={saving} />;
    case 'metrics':
      return <MetricsEditor value={value as MetricItem[]} onSave={onSave} onCancel={onCancel} saving={saving} />;
    case 'questions':
      return <QuestionsEditor value={value as QuestionItem[]} onSave={onSave} onCancel={onCancel} saving={saving} />;
    default:
      return null;
  }
}

// ── Shared save/cancel buttons ────────────────────────────────────────────────

function SaveCancel({ onSave, onCancel, saving }: { onSave: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={onSave}
        disabled={saving}
        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
      <button
        onClick={onCancel}
        className="text-xs text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  );
}

// ── Field input helper ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400";
  return (
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} min-h-[60px] resize-y`} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      }
    </div>
  );
}

// ── Type definitions ──────────────────────────────────────────────────────────

interface PersonaItem { name: string; role: string; context: string; pain_point: string; }
interface StoryItem { story: string; priority: 'must-have' | 'should-have' | 'nice-to-have'; }
interface CriteriaItem { story_ref: string; criteria: string[]; }
interface EdgeCaseItem { scenario: string; expected_behavior: string; }
interface MetricItem { metric: string; target: string; measurement_method: string; timeframe: string; }
interface QuestionItem { question: string; owner: string; impact: string; }

// ── String array editor (JTBD, Out of Scope) ──────────────────────────────────

function StringArrayEditor({ value, onSave, onCancel, saving }: {
  value: string[];
  onSave: (v: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [items, setItems] = useState<string[]>(value ?? []);

  const update = (i: number, v: string) => setItems(prev => prev.map((x, idx) => idx === i ? v : x));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setItems(prev => [...prev, '']);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 text-sm pt-2">✕</button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add item</button>
      <SaveCancel onSave={() => onSave(items)} onCancel={onCancel} saving={saving} />
    </div>
  );
}

// ── Personas editor ───────────────────────────────────────────────────────────

function PersonasEditor({ value, onSave, onCancel, saving }: {
  value: PersonaItem[];
  onSave: (v: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [items, setItems] = useState<PersonaItem[]>(value ?? []);

  const update = (i: number, field: keyof PersonaItem, v: string) =>
    setItems(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: v } : x));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setItems(prev => [...prev, { name: '', role: '', context: '', pain_point: '' }]);

  return (
    <div className="space-y-4">
      {items.map((p, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xs">Remove</button>
          <Field label="Name" value={p.name} onChange={(v) => update(i, 'name', v)} />
          <Field label="Role" value={p.role} onChange={(v) => update(i, 'role', v)} />
          <Field label="Context" value={p.context} onChange={(v) => update(i, 'context', v)} multiline />
          <Field label="Pain point" value={p.pain_point} onChange={(v) => update(i, 'pain_point', v)} multiline />
        </div>
      ))}
      <button onClick={add} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add persona</button>
      <SaveCancel onSave={() => onSave(items)} onCancel={onCancel} saving={saving} />
    </div>
  );
}

// ── User stories editor ───────────────────────────────────────────────────────

function StoriesEditor({ value, onSave, onCancel, saving }: {
  value: StoryItem[];
  onSave: (v: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [items, setItems] = useState<StoryItem[]>(value ?? []);

  const update = (i: number, field: keyof StoryItem, v: string) =>
    setItems(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: v } : x));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setItems(prev => [...prev, { story: '', priority: 'should-have' }]);

  return (
    <div className="space-y-3">
      {items.map((s, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xs">Remove</button>
          <Field label="Story" value={s.story} onChange={(v) => update(i, 'story', v)} multiline />
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            <select
              value={s.priority}
              onChange={(e) => update(i, 'priority', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="must-have">must-have</option>
              <option value="should-have">should-have</option>
              <option value="nice-to-have">nice-to-have</option>
            </select>
          </div>
        </div>
      ))}
      <button onClick={add} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add story</button>
      <SaveCancel onSave={() => onSave(items)} onCancel={onCancel} saving={saving} />
    </div>
  );
}

// ── Acceptance criteria editor ────────────────────────────────────────────────

function CriteriaEditor({ value, onSave, onCancel, saving }: {
  value: CriteriaItem[];
  onSave: (v: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [items, setItems] = useState<CriteriaItem[]>(value ?? []);

  const updateRef = (i: number, v: string) =>
    setItems(prev => prev.map((x, idx) => idx === i ? { ...x, story_ref: v } : x));
  const updateCriteria = (i: number, j: number, v: string) =>
    setItems(prev => prev.map((x, idx) => idx === i
      ? { ...x, criteria: x.criteria.map((c, ci) => ci === j ? v : c) }
      : x));
  const addCriteria = (i: number) =>
    setItems(prev => prev.map((x, idx) => idx === i ? { ...x, criteria: [...x.criteria, ''] } : x));
  const removeCriteria = (i: number, j: number) =>
    setItems(prev => prev.map((x, idx) => idx === i
      ? { ...x, criteria: x.criteria.filter((_, ci) => ci !== j) }
      : x));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setItems(prev => [...prev, { story_ref: '', criteria: [''] }]);

  return (
    <div className="space-y-4">
      {items.map((ac, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xs">Remove</button>
          <Field label="Story reference" value={ac.story_ref} onChange={(v) => updateRef(i, v)} />
          <label className="block text-xs font-medium text-gray-500 mb-1">Criteria (Given/When/Then)</label>
          {ac.criteria.map((c, j) => (
            <div key={j} className="flex gap-2 items-start mb-2">
              <input
                type="text"
                value={c}
                onChange={(e) => updateCriteria(i, j, e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Given ... When ... Then ..."
              />
              <button onClick={() => removeCriteria(i, j)} className="text-gray-400 hover:text-red-500 text-sm pt-2">✕</button>
            </div>
          ))}
          <button onClick={() => addCriteria(i)} className="text-xs text-indigo-600 hover:text-indigo-800">+ Add criterion</button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add acceptance criteria</button>
      <SaveCancel onSave={() => onSave(items)} onCancel={onCancel} saving={saving} />
    </div>
  );
}

// ── Edge cases editor ─────────────────────────────────────────────────────────

function EdgeCasesEditor({ value, onSave, onCancel, saving }: {
  value: EdgeCaseItem[];
  onSave: (v: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [items, setItems] = useState<EdgeCaseItem[]>(value ?? []);

  const update = (i: number, field: keyof EdgeCaseItem, v: string) =>
    setItems(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: v } : x));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setItems(prev => [...prev, { scenario: '', expected_behavior: '' }]);

  return (
    <div className="space-y-3">
      {items.map((ec, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xs">Remove</button>
          <Field label="Scenario" value={ec.scenario} onChange={(v) => update(i, 'scenario', v)} multiline />
          <Field label="Expected behavior" value={ec.expected_behavior} onChange={(v) => update(i, 'expected_behavior', v)} multiline />
        </div>
      ))}
      <button onClick={add} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add edge case</button>
      <SaveCancel onSave={() => onSave(items)} onCancel={onCancel} saving={saving} />
    </div>
  );
}

// ── Success metrics editor ────────────────────────────────────────────────────

function MetricsEditor({ value, onSave, onCancel, saving }: {
  value: MetricItem[];
  onSave: (v: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [items, setItems] = useState<MetricItem[]>(value ?? []);

  const update = (i: number, field: keyof MetricItem, v: string) =>
    setItems(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: v } : x));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setItems(prev => [...prev, { metric: '', target: '', measurement_method: '', timeframe: '' }]);

  return (
    <div className="space-y-3">
      {items.map((m, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xs">Remove</button>
          <Field label="Metric" value={m.metric} onChange={(v) => update(i, 'metric', v)} />
          <Field label="Target" value={m.target} onChange={(v) => update(i, 'target', v)} />
          <Field label="Measurement method" value={m.measurement_method} onChange={(v) => update(i, 'measurement_method', v)} multiline />
          <Field label="Timeframe" value={m.timeframe} onChange={(v) => update(i, 'timeframe', v)} />
        </div>
      ))}
      <button onClick={add} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add metric</button>
      <SaveCancel onSave={() => onSave(items)} onCancel={onCancel} saving={saving} />
    </div>
  );
}

// ── Open questions editor ─────────────────────────────────────────────────────

function QuestionsEditor({ value, onSave, onCancel, saving }: {
  value: QuestionItem[];
  onSave: (v: unknown) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [items, setItems] = useState<QuestionItem[]>(value ?? []);

  const update = (i: number, field: keyof QuestionItem, v: string) =>
    setItems(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: v } : x));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setItems(prev => [...prev, { question: '', owner: '', impact: '' }]);

  return (
    <div className="space-y-3">
      {items.map((q, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xs">Remove</button>
          <Field label="Question" value={q.question} onChange={(v) => update(i, 'question', v)} multiline />
          <Field label="Owner (who should answer)" value={q.owner} onChange={(v) => update(i, 'owner', v)} />
          <Field label="Impact if unresolved" value={q.impact} onChange={(v) => update(i, 'impact', v)} multiline />
        </div>
      ))}
      <button onClick={add} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add question</button>
      <SaveCancel onSave={() => onSave(items)} onCancel={onCancel} saving={saving} />
    </div>
  );
}
