interface Props {
  correct: number;
  total: number;
  onRetry: () => void;
}

interface CircularProps {
  score: number;
  correct: number;
  total: number;
}

function CircularProgress({ score, correct, total }: CircularProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke="#E5DDD4"
        strokeWidth="9"
      />
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke="#9B8EC7"
        strokeWidth="9"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        className="transition-all duration-700 ease-out"
      />
      <text
        x="55"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[18px] font-bold fill-[#9B8EC7] font-sans"
      >
        {correct}/{total}
      </text>
      <text
        x="55"
        y="67"
        textAnchor="middle"
        className="text-[11px] fill-[#9B8EC7] font-sans"
      >
        {score}%
      </text>
    </svg>
  );
}

export default function QuizResultPage({ correct, total, onRetry }: Props) {
  const incorrect = total - correct;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getHeaderMessage = () => {
    if (score === 100)
      return {
        title: "Perfect Score!",
        sub: "Incredible! You got every single question right!",
      };
    if (score >= 80)
      return {
        title: "Excellent Work!",
        sub: "You have a strong grasp of the material. Just a couple more to go for perfection!",
      };
    if (score >= 60)
      return {
        title: "Good Job!",
        sub: "You have a solid understanding. Keep practicing to reach the top!",
      };
    return {
      title: "Keep Practicing!",
      sub: "A bit more practice and you will master this topic!",
    };
  };

  const { title, sub } = getHeaderMessage();

  const handleShowBreakdown = () => {
    // Feature in development.
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-[340px] bg-white rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col">
        <div className="bg-[#9B8EC7] pt-7 pb-5 px-6 flex flex-col items-center gap-2">
          <div className="text-[22px] leading-none">⭐</div>
          <h1 className="text-white text-[18px] font-bold text-center m-0">
            {title}
          </h1>
          <p className="text-white/90 text-[12px] text-center leading-relaxed max-w-[260px] m-0">
            {sub}
          </p>
        </div>

        <div className="bg-[#F2EAE0] w-full flex justify-center py-6 border-b border-white/50">
          <CircularProgress score={score} correct={correct} total={total} />
        </div>

        <div className="bg-white p-5 pt-6 flex flex-col items-center">
          <div className="flex gap-2.5 w-full mb-5">
            <div className="flex-1 bg-[#B2D8D0] rounded-[12px] py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-[24px] font-bold text-[#1E5F56] leading-none">
                {correct}
              </span>
              <span className="text-[11px] font-medium text-[#2E6B62]">
                Correct
              </span>
            </div>

            <div className="flex-1 bg-[#DDD0E8] rounded-[12px] py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-[24px] font-bold text-[#5A2D82] leading-none">
                {incorrect}
              </span>
              <span className="text-[11px] font-medium text-[#6B3E8A]">
                Incorrect
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <button
              onClick={handleShowBreakdown}
              className="w-full h-[44px] rounded-[14px] bg-white border-[1.5px] border-[#1E5F56] text-[#1E5F56] text-[14px] font-semibold hover:bg-[#F2F8F7] transition-colors"
            >
              Show Answer Breakdown
            </button>

            <button
              onClick={onRetry}
              className="w-full h-[44px] rounded-[14px] bg-[#9B8EC7] border-none text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
            >
              Retry Quiz
            </button>
          </div>

          <p className="mt-[14px] text-[11px] text-[#B0A8C2] text-center">
            Quiz completed on {today}
          </p>
        </div>
      </div>
    </div>
  );
}
