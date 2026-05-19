import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { QuizQuestion } from "../types";

interface Props {
  question: QuizQuestion;
  onNext: (answer: { selectedIdx: number; writtenAnswer?: string }) => void;
  onPrev: () => void;
  index: number;
  total: number;
  isSubmitting?: boolean;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizQuestionPage({
  question,
  onNext,
  onPrev,
  index,
  total,
  isSubmitting = false,
}: Props) {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");

  // Reset on new question — also clears any stale selection when navigating Prev.
  useEffect(() => {
    setSelectedIdx(null);
    setWrittenAnswer("");
  }, [question]);

  const isWritten = question.type === "written";
  const hasAnswer = isWritten ? writtenAnswer.trim() !== "" : selectedIdx !== null;
  const isLast = index + 1 === total;

  const handleNext = () => {
    if (!hasAnswer || isSubmitting) return;
    onNext({
      selectedIdx: selectedIdx ?? -1,
      writtenAnswer: isWritten ? writtenAnswer : undefined,
    });
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center w-full max-w-[800px] mx-auto px-4 py-8">
      <div className="w-full">
        {/* Top status bar */}
        <div className="flex justify-between items-center text-[#6A7282] text-sm font-medium mb-4 px-2">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="flex items-center gap-1 hover:text-[#9B8EC7] transition-colors"
          >
            <span>&lt;</span> Exit
          </button>
          <span className="text-gray-800 font-bold">
            {index + 1} / {total}
          </span>
          <span>&nbsp;</span>
        </div>

        {/* Progress bar */}
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
              Question {index + 1}
            </div>
          </div>

          <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-8 leading-snug">
            {question.text}
          </h2>

          {isWritten ? (
            <div className="mb-8">
              <textarea
                value={writtenAnswer}
                onChange={(event) => setWrittenAnswer(event.target.value)}
                className="w-full min-h-[140px] rounded-[16px] border-2 border-[#E5E7EB] bg-white p-4 text-[16px] text-[#4B5563] outline-none focus:border-[#9B8EC7]"
                placeholder="Scrie raspunsul aici..."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-8">
              {(question.options ?? []).map((option, optIdx) => {
                const isSelected = selectedIdx === optIdx;
                const containerClasses = isSelected
                  ? "border-[#9B8EC7] bg-[#F9F7FA]"
                  : "border-[#E5E7EB] bg-white hover:border-[#BDA6CE]";
                const circleClasses = isSelected
                  ? "bg-[#9B8EC7] text-white"
                  : "bg-[#F2EAE0] text-[#6A7282]";
                const textClasses = isSelected ? "text-[#333333]" : "text-[#4B5563]";

                return (
                  <button
                    key={optIdx}
                    onClick={() => setSelectedIdx(optIdx)}
                    className={`w-full flex items-center text-left p-4 rounded-[16px] border-2 transition-all duration-200 ${containerClasses}`}
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 font-bold text-sm transition-colors shrink-0 ${circleClasses}`}
                    >
                      {OPTION_LABELS[optIdx] ?? ""}
                    </div>
                    <span className={`text-[16px] ${textClasses}`}>{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={onPrev}
              className="px-6 py-3 border-2 border-[#E5E7EB] text-[#A0AABF] font-semibold rounded-[16px] hover:bg-gray-50 transition-colors flex items-center gap-2"
              disabled={index === 0 || isSubmitting}
            >
              <span>&lt;</span> Prev
            </button>

            <button
              onClick={handleNext}
              disabled={!hasAnswer || isSubmitting}
              className={`px-8 py-3 rounded-[16px] font-semibold text-white transition-all flex items-center justify-center
                ${
                  hasAnswer && !isSubmitting
                    ? "bg-[#9B8EC7] hover:opacity-90 shadow-md"
                    : "bg-[#D1D5DB] cursor-not-allowed"
                }
              `}
            >
              {isSubmitting ? "Se trimite..." : isLast ? "Trimite Quiz" : "Următoarea"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
