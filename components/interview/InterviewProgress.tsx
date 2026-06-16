interface InterviewProgressProps {
  current: number;
  total: number;
}

export default function InterviewProgress({ current, total }: InterviewProgressProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Question {current} of {total}
        </span>
        <span className="text-xs text-primary font-medium">{pct}%</span>
      </div>
      {/* Gradient progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg,#6D5EF5,#22D3EE)',
          }}
        />
      </div>
    </div>
  );
}
