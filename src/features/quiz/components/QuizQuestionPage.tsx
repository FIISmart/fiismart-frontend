import { useState, useEffect, type ReactNode } from "react";
import type { QuizQuestion } from "../types";

interface Props {
  question: QuizQuestion;
  onNext: (isCorrect: boolean) => void;
  index: number;
  total: number;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizQuestionPage({
  question,
  onNext,
  index,
  total,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Reset on new question
  useEffect(() => {
    setSelectedIdx(null);
    setIsSubmitted(false);
  }, [question]);

  const handleConfirm = () => {
    if (!isSubmitted && selectedIdx !== null) {
      setIsSubmitted(true);
    } else if (isSubmitted) {
      onNext(selectedIdx === question.correctIdx);
    }
  };

  const isCorrect = selectedIdx === question.correctIdx;

  return (
    <div className="flex-grow flex flex-col justify-center items-center w-full max-w-[800px] mx-auto px-4 py-8">
      <div className="w-full">
        {/* Top status bar */}
        <div className="flex justify-between items-center text-[#6A7282] text-sm font-medium mb-4 px-2">
          <button className="flex items-center gap-1 hover:text-[#9B8EC7] transition-colors">
            <span>&lt;</span> Exit
          </button>
          <span className="text-gray-800 font-bold">
            {index + 1} / {total}
          </span>
          <span>{index} answered</span>
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
              Question {index + 1}
            </div>

            {isSubmitted && (
              <div
                className={`text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm ${
                  isCorrect ? "bg-[#84C5C4]" : "bg-[#E57373]"
                }`}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </div>
            )}
          </div>

          <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-8 leading-snug">
            {question.text}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-4 mb-8">
            {question.options.map((option, optIdx) => {
              const isSelected = selectedIdx === optIdx;
              const isThisCorrect = optIdx === question.correctIdx;

              let containerClasses =
                "border-[#E5E7EB] bg-white hover:border-[#BDA6CE]";
              let circleClasses = "bg-[#F2EAE0] text-[#6A7282]";
              let textClasses = "text-[#4B5563]";
              let content: ReactNode = OPTION_LABELS[optIdx] ?? "";

              if (isSubmitted) {
                if (isThisCorrect) {
                  containerClasses = "border-[#84C5C4] bg-[#F2F8F8]";
                  circleClasses = "bg-[#84C5C4] text-white";
                  textClasses = "text-[#31706E] font-semibold";
                  content = (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  );
                } else if (isSelected && !isThisCorrect) {
                  containerClasses = "border-[#E57373] bg-[#FDF6F6]";
                  circleClasses = "bg-[#E57373] text-white";
                  textClasses = "text-[#C62828] font-semibold";
                  content = (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  );
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

          {/* Explanation */}
          {isSubmitted && question.explanation && (
            <div className="bg-[#EBE3D8] rounded-[16px] p-6 mb-8 border border-[#E0D6C8]">
              <p className="text-[#5A4A3A] text-[15px] leading-relaxed">
                <span className="font-bold text-[#3E3228]">Explanation: </span>
                {question.explanation}
              </p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-between items-center">
            <button
              className="px-6 py-3 border-2 border-[#E5E7EB] text-[#A0AABF] font-semibold rounded-[16px] hover:bg-gray-50 transition-colors flex items-center gap-2"
              disabled={isSubmitted || index === 0}
            >
              <span>&lt;</span> Prev
            </button>

            <button
              onClick={handleConfirm}
              disabled={selectedIdx === null}
              className={`px-8 py-3 rounded-[16px] font-semibold text-white transition-all flex items-center justify-center
                  ${
                    selectedIdx !== null
                      ? "bg-[#9B8EC7] hover:opacity-90 shadow-md"
                      : "bg-[#D1D5DB] cursor-not-allowed"
                  }
                `}
            >
              {isSubmitted ? (
                <>
                  Next
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
                "Confirm Answer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
