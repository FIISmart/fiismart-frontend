import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { StudentQuiz } from "../types";

interface QuizzesTableProps {
  quizzes: StudentQuiz[];
}

const PASSED_STATUSES = new Set(["Promovat", "ACTIV"]);

export function QuizzesTable({ quizzes }: QuizzesTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const visibleQuizzes = isExpanded ? quizzes : quizzes.slice(0, 3);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Quiz-urile Mele</h2>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="text-[13px] font-bold text-primary hover:underline focus:outline-none"
        >
          {isExpanded ? "Restrânge" : "Vezi toate"}
        </button>
      </div>
      <div className="bg-card rounded-2xl shadow-sm border border-black/5 overflow-hidden">
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
                const scoreClass = quiz.scor < 70 ? "text-warning" : "text-success";
                const statusClass = passed
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning";

                return (
                  <tr
                    key={`${quiz.titluQuiz}-${i}`}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="px-8 py-5 font-bold text-foreground">{quiz.titluQuiz}</td>
                    <td className="px-8 py-5 text-gray-500 font-semibold">{quiz.numeCurs}</td>
                    <td className="px-8 py-5 text-center font-bold">{quiz.incercari}</td>
                    <td className={`px-8 py-5 text-center font-bold ${scoreClass}`}>
                      {quiz.scor}%
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest ${statusClass}`}>
                        {quiz.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <MoreVertical
                        className="size-4 text-gray-300 ml-auto cursor-pointer hover:text-gray-500"
                        onClick={() => {
                          if (quiz.quizId) navigate(`/student/quizzes/${quiz.quizId}`);
                        }}
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
