import { Button } from "@/components/ui/button";

interface Props {
  correct: number;
  total: number;
  onRetry: () => void;
  onBack?: () => void;
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
        strokeWidth="9"
        className="stroke-border"
      />
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        strokeWidth="9"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        className="stroke-primary transition-all duration-700 ease-out"
      />
      <text
        x="55"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[18px] font-bold fill-primary font-sans"
      >
        {correct}/{total}
      </text>
      <text
        x="55"
        y="67"
        textAnchor="middle"
        className="text-[11px] fill-primary font-sans"
      >
        {score}%
      </text>
    </svg>
  );
}

export default function QuizResultPage({ correct, total, onRetry, onBack }: Props) {
  const incorrect = total - correct;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const today = new Date().toLocaleDateString("ro-RO", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getHeaderMessage = () => {
    if (score === 100)
      return {
        title: "Scor Perfect!",
        sub: "Incredibil! Ai răspuns corect la toate întrebările!",
      };
    if (score >= 80)
      return {
        title: "Excelent!",
        sub: "Ai o înțelegere foarte bună a materialului.",
      };
    if (score >= 60)
      return {
        title: "Bravo!",
        sub: "Ai trecut testul. Continuă să exerstezi pentru un scor și mai bun!",
      };
    return {
      title: "Mai încearcă!",
      sub: "Puțină practică în plus și vei stăpâni acest subiect!",
    };
  };

  const { title, sub } = getHeaderMessage();

  return (
    <div className="flex-grow flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-[340px] bg-card rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="bg-primary pt-7 pb-5 px-6 flex flex-col items-center gap-2">
          <div className="text-[22px] leading-none">⭐</div>
          <h1 className="text-primary-foreground text-[18px] font-bold text-center m-0">
            {title}
          </h1>
          <p className="text-primary-foreground/90 text-[12px] text-center leading-relaxed max-w-[260px] m-0">
            {sub}
          </p>
        </div>

        <div className="bg-background w-full flex justify-center py-6 border-b border-border">
          <CircularProgress score={score} correct={correct} total={total} />
        </div>

        <div className="bg-card p-5 pt-6 flex flex-col items-center">
          <div className="flex gap-2.5 w-full mb-5">
            <div className="flex-1 bg-accent/50 rounded-xl py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-[24px] font-bold text-primary leading-none">
                {correct}
              </span>
              <span className="text-[11px] font-medium text-primary">
                Corect
              </span>
            </div>

            <div className="flex-1 bg-secondary/50 rounded-xl py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-[24px] font-bold text-secondary leading-none">
                {incorrect}
              </span>
              <span className="text-[11px] font-medium text-secondary">
                Gresit
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            {onBack && (
              <Button
                onClick={onBack}
                className="w-full bg-accent text-accent-foreground"
              >
                Inapoi la curs
              </Button>
            )}

            <Button
              onClick={onRetry}
              className="w-full"
            >
              Reîncepe Quiz
            </Button>
          </div>

          <p className="mt-[14px] text-[11px] text-muted-foreground text-center">
            Finalizat la data de {today}
          </p>
        </div>
      </div>
    </div>
  );
}