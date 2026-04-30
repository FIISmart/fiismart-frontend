import { useState } from "react";
import { MoreVertical } from "lucide-react";
import type { StudentQuiz } from "../types";

interface QuizzesTableProps {
  quizzes: StudentQuiz[];
}

const PASSED_STATUSES = new Set(["Promovat", "ACTIV"]);

/**
 * Wide table of quiz attempts with horizontal scroll on mobile and a
 * "see all"/"collapse" toggle.
 */
export function QuizzesTable({ quizzes }: QuizzesTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleQuizzes = isExpanded ? quizzes : quizzes.slice(0, 3);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-[19px] text-[#1a1a2e]">Quiz-urile Mele</h2>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="text-[13px] font-bold text-[#9b8ec7] hover:underline focus:outline-none"
        >
          {isExpanded ? "Restrânge" : "Vezi toate"}
        </button>
      </div>
      <div className="bg-white rounded-[20px] shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50/60 border-b border-gray-100">
              <tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
                <th className="px-8 py-4">Titlu Quiz</th>
                <th className="px-8 py-4">Curs</th>
                <th className="px-8 py-4 text-center">Incercari</th>
                <th className="px-8 py-4 text-center">Scor</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Actiuni</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] font-medium">
              {visibleQuizzes.map((quiz, i) => {
                const passed = PASSED_STATUSES.has(quiz.status);
                const scoreClass = quiz.scor < 70 ? "text-orange-500" : "text-[#22c55e]";
                const statusClass = passed
                  ? "bg-green-100 text-[#22c55e]"
                  : "bg-yellow-100 text-yellow-700";

                return (
                  <tr
                    key={`${quiz.titluQuiz}-${i}`}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="px-8 py-5 font-bold text-[#1a1a2e]">{quiz.titluQuiz}</td>
                    <td className="px-8 py-5 text-gray-500 font-semibold">{quiz.numeCurs}</td>
                    <td className="px-8 py-5 text-center font-bold">{quiz.incercari}</td>
                    <td className={`px-8 py-5 text-center font-bold ${scoreClass}`}>
                      {quiz.scor}%
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest ${statusClass}`}
                      >
                        {quiz.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <MoreVertical
                        size={16}
                        className="text-gray-300 ml-auto cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
