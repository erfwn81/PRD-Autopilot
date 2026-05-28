interface InterviewProgressProps {
  current: number;
  total: number;
}

export default function InterviewProgress({ current, total }: InterviewProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i < current ? 'bg-indigo-600' : i === current - 1 ? 'bg-indigo-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">
        Question {current} of {total}
      </span>
    </div>
  );
}
