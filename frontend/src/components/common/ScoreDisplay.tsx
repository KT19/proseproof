interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-700';
    if (s >= 6) return 'text-amber-600';
    return 'text-red-700';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 9) return 'Excellent';
    if (s >= 7) return 'Good';
    if (s >= 5) return 'Fair';
    return 'Needs Work';
  };

  const getProgressColor = (s: number) => {
    if (s >= 8) return 'bg-green-700';
    if (s >= 6) return 'bg-amber-600';
    return 'bg-red-700';
  };

  return (
    <div className="bg-gradient-to-br from-[#faf8f5] to-[#f5e6d3] rounded-lg p-5 border border-[#d4c5a9] shadow-sm">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 gradient-gold"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-[#5d5245] font-[Inter]">Writing Score</h3>
          <p className={`text-lg font-semibold font-[Playfair_Display] ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-4xl font-bold font-[Playfair_Display] ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-[#8b8173] text-xl">/10</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-[#e8e0d0] rounded-full overflow-hidden mb-3">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getProgressColor(score)}`}
          style={{ width: `${score * 10}%` }}
        ></div>
      </div>

      {/* Score Indicators */}
      <div className="flex justify-between">
        {[1, 3, 5, 7, 9, 10].map((mark) => (
          <div key={mark} className="flex flex-col items-center">
            <div
              className={`w-1 h-2 rounded-full ${
                score >= mark ? getProgressColor(score) : 'bg-[#d4c5a9]'
              }`}
            ></div>
            <span className="text-[10px] text-[#8b8173] mt-1 font-[Inter]">{mark}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
