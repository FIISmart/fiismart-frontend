import { Badge } from "@/components/ui/badge";
import type { QuizQuestion, QuizAttemptAnswer } from "../types";

interface Props {
  correct: number;
  total: number;
  onRetry: () => void;
  onBack?: () => void;
  /**
   * Optional per-question breakdown. When provided alongside `answers`, the
   * result page renders an AI-grading panel for every free_text answer. Kept
   * optional so legacy callers (and the timeout / abandon paths that have no
   * BE response yet) keep working.
   */
  questions?: QuizQuestion[];
  answers?: QuizAttemptAnswer[];
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

export default function QuizResultPage({
  correct,
  total,
  onRetry,
  onBack,
  questions,
  answers,
}: Props) {
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
        sub: "Ai trecut testul. Continuă să exersezi pentru un scor și mai bun!",
      };
    return {
      title: "Mai încearcă!",
      sub: "Puțină practică în plus și vei stăpâni acest subiect!",
    };
  };

  const { title, sub } = getHeaderMessage();

  // Pair questions with their answers (matching by questionId) and pick out
  // the free_text ones so we can render an AI panel per question below the
  // summary card. Only runs when the caller supplied both lists.
  const freeTextEntries =
    questions && answers
      ? questions
          .map((q, index) => {
            const answer = answers.find((a) => a.questionId === q.id);
            return { question: q, answer, index };
          })
          .filter((entry) => entry.question.type === "free_text")
      : [];

  return (
    <div className="flex-grow flex flex-col items-center p-4 py-8 gap-6">
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
                Corect
              </span>
            </div>

            <div className="flex-1 bg-[#DDD0E8] rounded-[12px] py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-[24px] font-bold text-[#5A2D82] leading-none">
                {incorrect}
              </span>
              <span className="text-[11px] font-medium text-[#6B3E8A]">
                Gresit
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-full h-[44px] rounded-[14px] bg-[#84C5C4] border-none text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Inapoi la curs
              </button>
            )}

            <button
              onClick={onRetry}
              className="w-full h-[44px] rounded-[14px] bg-[#9B8EC7] border-none text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
            >
              Reîncepe Quiz
            </button>
          </div>

          <p className="mt-[14px] text-[11px] text-[#B0A8C2] text-center">
            Finalizat la data de {today}
          </p>
        </div>
      </div>

      {freeTextEntries.length > 0 && (
        <div className="w-full max-w-[560px] flex flex-col gap-4">
          <h2 className="text-[14px] font-semibold text-[#5A4A3A] text-center">
            Evaluare AI pe întrebări
          </h2>
          {freeTextEntries.map(({ question, answer, index }) => (
            <FreeTextAiPanel
              key={question.id}
              index={index}
              question={question}
              answer={answer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FreeTextAiPanelProps {
  index: number;
  question: QuizQuestion;
  answer: QuizAttemptAnswer | undefined;
}

/**
 * Per-question AI grading breakdown. Renders score + confidence + reasoning +
 * any missing concepts the AI flagged. Gracefully degrades when grading was
 * unavailable (aiScore === null) or the BE hasn't returned an answer for this
 * question id at all.
 */
function FreeTextAiPanel({ index, question, answer }: FreeTextAiPanelProps) {
  const passThreshold = question.passThreshold ?? 70;
  const aiScore = answer?.aiScore;
  const aiConfidence = answer?.aiConfidence;
  const aiReasoning = answer?.aiReasoning;
  const aiMissing = answer?.aiMissingConcepts ?? [];

  // Null aiScore means grading failed entirely (rate limit, AI timeout, etc).
  // Undefined means we don't have an answer record yet — same fallback message.
  const gradingUnavailable = aiScore == null;

  const scoreColor = (() => {
    if (gradingUnavailable) return "text-[#6A7282]";
    if ((aiScore as number) >= passThreshold) return "text-[#1E5F56]";
    if ((aiScore as number) >= 50) return "text-[#B45309]";
    return "text-[#C62828]";
  })();

  return (
    <div className="w-full rounded-[16px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9B8EC7]/20 text-xs font-semibold text-[#5A2D82]">
          {index + 1}
        </span>
        <p className="flex-1 truncate text-sm font-medium text-[#5A4A3A]">
          {question.text}
        </p>
      </div>

      {gradingUnavailable ? (
        <p className="text-sm text-muted-foreground">
          Evaluare AI indisponibilă — contactați profesorul.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <div>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Scor AI
              </span>
              <div className={`text-[20px] font-bold leading-tight ${scoreColor}`}>
                {Math.round(aiScore as number)}/100
              </div>
            </div>
            {typeof aiConfidence === "number" && (
              <div>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Încredere AI
                </span>
                <div className="text-[20px] font-bold leading-tight text-[#5A4A3A]">
                  {Math.round(aiConfidence * 100)}%
                </div>
              </div>
            )}
          </div>

          {aiReasoning && (
            <div>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Feedback
              </span>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {aiReasoning}
              </p>
            </div>
          )}

          {aiMissing.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Concepte lipsă
              </span>
              <div className="flex flex-wrap gap-1.5">
                {aiMissing.map((concept, i) => (
                  <Badge key={`${concept}-${i}`} variant="destructive">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
