'use client';

interface VerdictGaugeProps {
  score: number;
  recommendation: string;
  size?: 'sm' | 'md' | 'lg';
}

function scoreColor(score: number): string {
  if (score >= 70) return '#22C55E';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

const recommendationLabels: Record<string, string> = {
  build: 'Build It',
  pivot: 'Pivot',
  'validate-more': 'Validate More',
  avoid: 'Avoid',
};

export default function VerdictGauge({ score, recommendation, size = 'md' }: VerdictGaugeProps) {
  const dimensions = { sm: 64, md: 100, lg: 140 };
  const dim = dimensions[size];
  const radius = (dim / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = scoreColor(score);
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const fontSize = size === 'sm' ? 14 : size === 'md' ? 22 : 30;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        <text
          x={dim / 2}
          y={dim / 2 + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
      </svg>
      {size !== 'sm' && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {recommendationLabels[recommendation] ?? recommendation}
        </span>
      )}
    </div>
  );
}
