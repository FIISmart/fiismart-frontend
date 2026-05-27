import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { QuizQuestion } from "../types";

interface Props {
  question: QuizQuestion;
  onNext: (answer: { selectedIdx: number; writtenAnswer?: string; isCorrect: boolean }) => void;
  onPrev: () => void;
  index: number;
  total: number;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

/**
 * Maximum length of a free-text answer. The student is shown a counter and the
 * underlying textarea enforces the limit so a paste of an entire document
 * doesn't reach the AI grader as a 100k+ char request.
 */
const FREE_TEXT_MAX_LENGTH = 5000;

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

  // Reset on new question
  useEffect(() => {
    setSelectedIdx(null);
    setWrittenAnswer("");
    setIsSubmitted(false);
  }, [question]);

  const isWritten = question.type === "written";
  const isFreeText = question.type === "free_text";
  const isTextAnswer = isWritten || isFreeText;

  const handleConfirm = () => {
    const hasAnswer = isTextAnswer ? writtenAnswer.trim() !== "" : selectedIdx !== null;

    if (!isSubmitted && hasAnswer) {
      setIsSubmitted(true);
    } else if (isSubmitted) {
      onNext({
        selectedIdx: selectedIdx ?? -1,
        // Both 'written' and 'free_text' use the writtenAnswer payload field.
        // The BE differentiates by question.type — free_text triggers async
        // AI grading, written uses exact-match.
        writtenAnswer: isTextAnswer ? writtenAnswer : undefined,
        isCorrect,
      });
    }
  };

  const normalizedWrittenAnswer = writtenAnswer.trim().toLowerCase();
  const normalizedCorrectText = (question.correctText ?? "").trim().toLowerCase();
  // We CANNOT determine MCQ or free_text correctness locally: the
  // student-facing /student-quizzes/{id} payload deliberately strips
  // `correctIdx` (and `correctText`) so the answer key never reaches the
  // browser — see StudentPlayableQuestionDTO on the BE. The authoritative
  // verdict comes back from the BE on submit and is reflected on the
  // result page. Report `false` optimistically for MCQ/free_text and let
  // the BE win.
  //
  // Previously this read `selectedIdx === question.correctIdx`, which was
  // ALWAYS false for MCQ because correctIdx was undefined on the wire —
  // every confirmed MCQ answer flashed "Greșit" regardless of pick.
  const isCorrect = isFreeText
    ? false
    : isWritten
      ? Boolean(normalizedCorrectText) && normalizedWrittenAnswer === normalizedCorrectText
      : false;
  const canConfirm = isTextAnswer ? writtenAnswer.trim() !== "" : selectedIdx !== null;

  return (
    <div className="flex-grow flex flex-col justify-center items-center w-full max-w-[800px] mx-auto px-4 py-8">
      <div className="w-full">
        {/* Top status bar */}
        <div className="flex justify-between items-center text-[#6A7282] text-sm font-medium mb-4 px-2">
          <button
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center gap-1 hover:text-[#9B8EC7] transition-colors"
          >
            <span>&lt;</span> Ieșire
          </button>
          <span className="text-gray-800 font-bold">
            {index + 1} / {total}
          </span>
          <span>{index} răspunsuri</span>
        </div>

        {/* Progress bar — slot-based to avoid inline styles */}
        <div className="w-full h-2 bg-[#E5E7EB] rounded-full mb-6 overflow-hidden flex">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={
                i < index
                  ? "flex-1 h-full bg-gradient-to-r from-[#B4D3D9] to-[#9B8EC7] transition-all duration-500"
                  : "flex-1 h-full transition-all duration-500"
              }
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white w-full rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] p-8 sm:p-10 relative">
          <div className="flex gap-3 mb-6">
            <div className="bg-[#9B8EC7] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
              Întrebare {index + 1}
            </div>

            {isSubmitted && isFreeText && (
              <div className="bg-[#9B8EC7] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                Evaluat de AI
              </div>
            )}
            {isSubmitted && isWritten && (
              <div
                className={`text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm ${
                  isCorrect ? "bg-[#84C5C4]" : "bg-[#E57373]"
                }`}
              >
                {isCorrect ? "Corect!" : "Greșit"}
              </div>
            )}
            {/* MCQ verdicts are computed server-side (the answer key never
                reaches the browser). Show a neutral "Răspuns trimis" pill
                here and let QuizResultPage display the authoritative score. */}
            {isSubmitted && !isFreeText && !isWritten && (
              <div className="bg-[#9B8EC7] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                Răspuns trimis
              </div>
            )}
          </div>

          <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-8 leading-snug">
            {question.text}
          </h2>

          {isTextAnswer ? (
            <div className="mb-8">
              <textarea
                value={writtenAnswer}
                onChange={(event) => !isSubmitted && setWrittenAnswer(event.target.value)}
                disabled={isSubmitted}
                rows={isFreeText ? 8 : undefined}
                // Clamp free-text answers to a reasonable upper bound so a
                // pasted essay (100k chars) can't blow up the API request.
                maxLength={isFreeText ? FREE_TEXT_MAX_LENGTH : undefined}
                className={`w-full rounded-[16px] border-2 border-[#E5E7EB] bg-white p-4 text-[16px] text-[#4B5563] outline-none focus:border-[#9B8EC7] ${
                  isFreeText ? "min-h-[160px]" : "min-h-[140px]"
                }`}
                placeholder={
                  isFreeText
                    ? "Scrie un raspuns detaliat aici..."
                    : "Scrie raspunsul aici..."
                }
              />
              {isFreeText && !isSubmitted && (
                <div className="mt-3 flex items-start justify-between gap-3">
                  <p className="text-xs text-[#6A7282]">
                    Răspunsul tău va fi evaluat de AI după trimitere. Această
                    evaluare poate dura câteva secunde.
                  </p>
                  <span className="text-xs text-[#6A7282] whitespace-nowrap tabular-nums">
                    {writtenAnswer.length} / {FREE_TEXT_MAX_LENGTH}
                  </span>
                </div>
              )}
              {isFreeText && isSubmitted && (
                <div className="mt-4 rounded-[16px] bg-[#F4F1F8] p-4 text-sm text-[#5A4A7A]">
                  Răspunsul tău a fost trimis pentru evaluare AI. Scorul și
                  feedback-ul vor apărea pe pagina de rezultate.
                </div>
              )}
              {isWritten && isSubmitted && (
                <div className={`mt-4 rounded-[16px] p-4 text-sm ${
                  isCorrect ? "bg-[#F2F8F8] text-[#31706E]" : "bg-[#FDF6F6] text-[#C62828]"
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

              let containerClasses =
                "border-[#E5E7EB] bg-white hover:border-[#BDA6CE]";
              let circleClasses = "bg-[#F2EAE0] text-[#6A7282]";
              let textClasses = "text-[#4B5563]";
              const content: ReactNode = OPTION_LABELS[optIdx] ?? "";

              // After submit we only know which option the student picked —
              // we do NOT know which one was correct (the BE intentionally
              // strips the answer key from /student-quizzes responses). So
              // we highlight the selected option neutrally and leave the
              // others dimmed. The authoritative verdict surfaces on the
              // result page once the BE has graded the submission.
              if (isSubmitted) {
                if (isSelected) {
                  containerClasses = "border-[#9B8EC7] bg-[#F9F7FA]";
                  circleClasses = "bg-[#9B8EC7] text-white";
                  textClasses = "text-[#333333] font-semibold";
                } else {
                  containerClasses = "border-[#E5E7EB] bg-white opacity-60";
                }
              } else if (isSelected) {
                containerClasses = "border-[#9B8EC7] bg-[#F9F7FA]";
                circleClasses = "bg-[#9B8EC7] text-white";
                textClasses = "text-[#333333]";
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => !isSubmitted && setSelectedIdx(optIdx)}
                  disabled={isSubmitted}
                  className={`w-full flex items-center text-left p-4 rounded-[16px] border-2 transition-all duration-200 ${containerClasses}`}
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

          {/* Explanation */}
          {isSubmitted && question.explanation && (
            <div className="bg-[#EBE3D8] rounded-[16px] p-6 mb-8 border border-[#E0D6C8]">
              <p className="text-[#5A4A3A] text-[15px] leading-relaxed">
                <span className="font-bold text-[#3E3228]">Explicație: </span>
                {question.explanation}
              </p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={onPrev}
              className="px-6 py-3 border-2 border-[#E5E7EB] text-[#A0AABF] font-semibold rounded-[16px] hover:bg-gray-50 transition-colors flex items-center gap-2"
              disabled={isSubmitted || index === 0}
            >
              <span>&lt;</span> Anterioara
            </button>

            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`px-8 py-3 rounded-[16px] font-semibold text-white transition-all flex items-center justify-center
                  ${
                    canConfirm
                      ? "bg-[#9B8EC7] hover:opacity-90 shadow-md"
                      : "bg-[#D1D5DB] cursor-not-allowed"
                  }
                `}
            >
              {isSubmitted ? (
                <>
                  Următoarea
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              ) : (
                "Confirmă răspunsul"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
