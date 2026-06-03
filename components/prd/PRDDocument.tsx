'use client';

import { useState } from 'react';
import { PRDDocument as PRDDocType } from '@/types';
import PRDSection from './PRDSection';

interface PRDDocumentProps {
  prd: PRDDocType;
  onSectionSave?: (section: string, value: unknown) => Promise<void>;
  onPrdChange?: (updatedPrd: PRDDocType) => void;
}

export default function PRDDocument({ prd: initialPrd, onSectionSave, onPrdChange }: PRDDocumentProps) {
  const [prd, setPrd] = useState<PRDDocType>(initialPrd);

  const handleSave = (section: string) => async (value: unknown) => {
    if (!onSectionSave) return;
    await onSectionSave(section, value);
    // Update local state immediately
    const updated = { ...prd, [section]: value };
    setPrd(updated);
    // Notify parent so ExportBar stays in sync
    onPrdChange?.(updated);
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
      <div className="p-8 pb-6">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
          Product Requirements Document
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          {prd.title ?? 'Untitled PRD'}
        </h1>
      </div>

      <div className="px-8">
        {prd.problem_statement && (
          <PRDSection
            title="1. Problem Statement"
            content={prd.problem_statement}
            sectionType="text"
            onSave={async (value) => {
              await handleSave('problem_statement')(value);
            }}
          />
        )}

        {Array.isArray(prd.user_personas) && (
          <PRDSection
            title="2. User Personas"
            content=""
            sectionType="personas"
            structuredValue={prd.user_personas}
            onStructuredSave={handleSave('user_personas')}
            renderContent={() => (
              <div className="grid gap-4 sm:grid-cols-2">
                {prd.user_personas!.map((p, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-indigo-600 mb-2">{p.role}</p>
                    <p className="text-sm text-gray-600 mb-1">{p.context}</p>
                    <p className="text-sm text-red-600 italic">
                      &ldquo;{p.pain_point}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {Array.isArray(prd.jobs_to_be_done) && (
          <PRDSection
            title="3. Jobs to Be Done"
            content=""
            sectionType="jtbd"
            structuredValue={prd.jobs_to_be_done}
            onStructuredSave={handleSave('jobs_to_be_done')}
            renderContent={() => (
              <ul className="space-y-2">
                {prd.jobs_to_be_done!.map((j, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-indigo-400 mt-0.5">›</span>
                    <span>{j}</span>
                  </li>
                ))}
              </ul>
            )}
          />
        )}

        {Array.isArray(prd.user_stories) && (
          <PRDSection
            title="4. User Stories"
            content=""
            sectionType="stories"
            structuredValue={prd.user_stories}
            onStructuredSave={handleSave('user_stories')}
            renderContent={() => (
              <div className="space-y-2">
                {prd.user_stories!.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                        s.priority === 'must-have'
                          ? 'bg-red-100 text-red-700'
                          : s.priority === 'should-have'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.priority}
                    </span>
                    <p>{s.story}</p>
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {Array.isArray(prd.acceptance_criteria) && (
          <PRDSection
            title="5. Acceptance Criteria"
            content=""
            sectionType="criteria"
            structuredValue={prd.acceptance_criteria}
            onStructuredSave={handleSave('acceptance_criteria')}
            renderContent={() => (
              <div className="space-y-4">
                {prd.acceptance_criteria!.map((ac, i) => (
                  <div key={i}>
                    <p className="font-medium text-gray-800 mb-1">{ac.story_ref}</p>
                    <ul className="space-y-1">
                      {ac.criteria.map((c, j) => (
                        <li key={j} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {Array.isArray(prd.edge_cases) && (
          <PRDSection
            title="6. Edge Cases & Error States"
            content=""
            sectionType="edge_cases"
            structuredValue={prd.edge_cases}
            onStructuredSave={handleSave('edge_cases')}
            renderContent={() => (
              <div className="space-y-3">
                {prd.edge_cases!.map((ec, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <p className="font-medium text-amber-900 text-sm">{ec.scenario}</p>
                    <p className="text-sm text-amber-700 mt-1">
                      {ec.expected_behavior}
                    </p>
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {Array.isArray(prd.out_of_scope) && (
          <PRDSection
            title="7. Out of Scope"
            content=""
            sectionType="out_of_scope"
            structuredValue={prd.out_of_scope}
            onStructuredSave={handleSave('out_of_scope')}
            renderContent={() => (
              <ul className="space-y-1.5">
                {prd.out_of_scope!.map((item, i) => (
                  <li key={i} className="flex gap-2 text-gray-600">
                    <span className="text-gray-400">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          />
        )}

        {Array.isArray(prd.success_metrics) && (
          <PRDSection
            title="8. Success Metrics"
            content=""
            sectionType="metrics"
            structuredValue={prd.success_metrics}
            onStructuredSave={handleSave('success_metrics')}
            renderContent={() => (
              <div className="grid gap-3 sm:grid-cols-2">
                {prd.success_metrics!.map((m, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900 text-sm">{m.metric}</p>
                    <p className="text-2xl font-bold text-indigo-600 my-1">
                      {m.target}
                    </p>
                    <p className="text-xs text-gray-500">{m.measurement_method}</p>
                    <p className="text-xs text-gray-400 mt-1">{m.timeframe}</p>
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {prd.rollout_plan &&
          typeof prd.rollout_plan === 'object' &&
          'phase_1' in prd.rollout_plan && (
            <PRDSection
              title="9. Phased Rollout Plan"
              content=""
              renderContent={() => (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    prd.rollout_plan!.phase_1,
                    prd.rollout_plan!.phase_2,
                    prd.rollout_plan!.phase_3,
                  ].map((phase, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                        Phase {i + 1}
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">{phase.name}</p>
                      <p className="text-xs text-gray-500 mb-3">{phase.duration}</p>
                      <ul className="space-y-1 mb-3">
                        {phase.features.map((f, j) => (
                          <li key={j} className="text-xs text-gray-600 flex gap-1.5">
                            <span>•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-green-700 bg-green-50 rounded p-2">
                        {phase.success_criteria}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            />
          )}

        {Array.isArray(prd.open_questions) && (
          <PRDSection
            title="10. Open Questions"
            content=""
            sectionType="questions"
            structuredValue={prd.open_questions}
            onStructuredSave={handleSave('open_questions')}
            renderContent={() => (
              <div className="space-y-3">
                {prd.open_questions!.map((q, i) => (
                  <div key={i} className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                    <p className="font-medium text-blue-900 text-sm">{q.question}</p>
                    <p className="text-xs text-blue-600 mt-1">Owner: {q.owner}</p>
                    <p className="text-xs text-blue-700 mt-1 italic">
                      Impact if unresolved: {q.impact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          />
        )}
      </div>
    </article>
  );
}