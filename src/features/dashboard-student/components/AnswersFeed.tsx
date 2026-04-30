import { Star } from "lucide-react";
import type { Answer } from "../types";

interface AnswersFeedProps {
  answers: Answer[];
}

/**
 * Vertical feed of recent Q&A answers received by the student.
 */
export function AnswersFeed({ answers }: AnswersFeedProps) {
  return (
    <section className="mb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-[19px] text-[#1a1a2e]">Răspunsuri</h2>
        <button
          type="button"
          className="text-[13px] font-bold text-[#9b8ec7] focus:outline-none"
        >
          Vezi toate
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {answers.map((ans, i) => (
          <div
            key={`${ans.autorRaspuns}-${i}`}
            className="bg-white p-5 rounded-[20px] shadow-sm border border-black/5 flex flex-col sm:flex-row gap-4 sm:gap-5"
          >
            <div className="w-11 h-11 bg-[#b4d3d9] rounded-full flex items-center justify-center font-bold text-[#1a1a2e] text-[14px] shrink-0">
              {ans.autorRaspuns?.charAt(0)}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-bold text-[15px]">{ans.autorRaspuns}</span>
                <span className="text-[10px] md:text-[11.5px] text-gray-400 font-medium">
                  RĂSPUNS NOU
                </span>
                <span className="px-2.5 py-0.5 bg-[#9b8ec7]/10 text-[#9b8ec7] rounded-full text-[10px] font-black uppercase">
                  Q&amp;A
                </span>
              </div>
              <p className="text-[13px] md:text-[13.5px] text-gray-500 font-medium italic mb-1">
                Q: {ans.intrebare}
              </p>
              <p className="text-[13px] md:text-[13.5px] text-[#1a1a2e] font-semibold">
                {ans.raspuns}
              </p>
              <div className="flex gap-5 mt-3 text-[10.5px] font-black text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-red-400">
                  <Star size={13} fill="#d1d5db" /> 0
                </div>
                <span className="cursor-pointer hover:text-[#9b8ec7]">Raspunde</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
