import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuizQuestion } from "../types";

interface Props {
  question: QuizQuestion;
  onNext: (answer: { selectedIdx: number; writtenAnswer?: string; isCorrect: boolean }) => void;
  onPrev: () => void;
  index: number;
  total: number;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizQuestionPage({
  question,
  onNext,
  onPrev,
  index,
  total,
}: Props) {
    const navigate = useNavigate();
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [writtenAnswer, setWrittenAnswer] = useState("");
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    setSelectedIdx(null);
    setWrittenAnswer("");
    setIsSubmitted(false);
  }, [question]);

  const handleConfirm = () => {
    const isWritten = question.type === "written";
    const hasAnswer = isWritten ? writtenAnswer.trim() !== "" : selectedIdx !== null;

    if (!isSubmitted && hasAnswer) {
      setIsSubmitted(true);
    } else if (isSubmitted) {
      onNext({
        selectedIdx: selectedIdx ?? -1,
        writtenAnswer: isWritten ? writtenAnswer : undefined,
        isCorrect,
      });
    }
  };

  const normalizedWrittenAnswer = writtenAnswer.trim().toLowerCase();
  const normalizedCorrectText = (question.correctText ?? "").trim().toLowerCase();
  const isCorrect = question.type === "written"
    ? Boolean(normalizedCorrectText) && normalizedWrittenAnswer === normalizedCorrectText
    : selectedIdx === question.correctIdx;
  const canConfirm = question.type === "written" ? writtenAnswer.trim() !== "" : selectedIdx !== null;

  return (
    <div className="flex-grow flex flex-col justify-center items-center w-full max-w-[800px] mx-auto px-4 py-8">
      <div className="w-full">
        <div className="flex justify-between items-center text-muted-foreground text-sm font-medium mb-4 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/student/dashboard")}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors h-auto p-0"
          >
            <ArrowLeft className="size-4" />
            Exit
          </Button>
          <span className="text-foreground font-bold">
            {index + 1} / {total}
          </span>
          <span>{index} answered</span>
        </div>

        <Progress
          value={total > 0 ? (index / total) * 100 : 0}
          className="mb-6"
        />

        <div className="bg-card w-full rounded-2xl shadow-lg p-8 sm:p-10 relative">
          <div className="flex gap-3 mb-6">
            <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
              Question {index + 1}
            </div>

            {isSubmitted && (
              <div
                className={`text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm ${
                  isCorrect ? "bg-accent" : "bg-destructive"
                }`}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </div>
            )}
          </div>

          <h2 className="text-[20px] sm:text-[24px] font-bold text-foreground mb-8 leading-snug">
            {question.text}
          </h2>

          {question.type === "written" ? (
            <div className="mb-8">
              <textarea
                value={writtenAnswer}
                onChange={(event) => !isSubmitted && setWrittenAnswer(event.target.value)}
                disabled={isSubmitted}
                className="w-full min-h-[140px] rounded-xl border-2 border-border bg-card p-4 text-[16px] text-foreground outline-none focus:border-primary"
                placeholder="Scrie raspunsul aici..."
              />
              {isSubmitted && (
                <div className={`mt-4 rounded-xl p-4 text-sm ${
                  isCorrect ? "bg-accent/20 text-primary" : "bg-destructive/10 text-destructive"
                }`}>
                  {isCorrect
                    ? "Raspuns corect."
                    : `Raspuns asteptat: ${question.correctText || "nu este definit"}`}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-8">
            {(question.options ?? []).map((option, optIdx) => {
              const isSelected = selectedIdx === optIdx;
              const isThisCorrect = optIdx === question.correctIdx;

              let containerClasses =
                "border-border bg-card hover:border-secondary";
              let circleClasses = "bg-background text-muted-foreground";
              let textClasses = "text-foreground";
              let content: ReactNode = OPTION_LABELS[optIdx] ?? "";

              if (isSubmitted) {
                if (isThisCorrect) {
                  containerClasses = "border-accent bg-accent/10";
                  circleClasses = "bg-accent text-accent-foreground";
                  textClasses = "text-primary font-semibold";
                  content = <Check className="size-5" />;
                } else if (isSelected && !isThisCorrect) {
                  containerClasses = "border-destructive bg-destructive/10";
                  circleClasses = "bg-destructive text-destructive-foreground";
                  textClasses = "text-destructive font-semibold";
                  content = <X className="size-5" />;
                } else {
                  containerClasses = "border-border bg-card opacity-60";
                }
              } else if (isSelected) {
                containerClasses = "border-primary bg-primary/5";
                circleClasses = "bg-primary text-primary-foreground";
                textClasses = "text-foreground";
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => !isSubmitted && setSelectedIdx(optIdx)}
                  disabled={isSubmitted}
                  className={`w-full flex items-center text-left p-4 rounded-xl border-2 transition-all duration-200 ${containerClasses}`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 font-bold text-sm transition-colors shrink-0 ${circleClasses}`}
                  >
                    {content}
                  </div>
                  <span className={`text-[16px] ${textClasses}`}>{option}</span>
                </button>
              );
            })}
            </div>
          )}

          {isSubmitted && question.explanation && (
            <div className="bg-muted rounded-xl p-6 mb-8 border border-border">
              <p className="text-foreground text-[15px] leading-relaxed">
                <span className="font-bold text-foreground">Explanation: </span>
                {question.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={isSubmitted || index === 0}
              className="font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Prev
            </Button>

            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={!canConfirm ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
            >
              {isSubmitted ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Confirm Answer"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}