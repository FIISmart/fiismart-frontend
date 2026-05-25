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
        <h2 className="text-xl font-semibold text-foreground">Răspunsuri</h2>
        <button
          type="button"
          className="text-[13px] font-bold text-primary focus:outline-none"
        >
          Vezi toate
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {answers.map((ans, i) => (
          <div
            key={`${ans.autorRaspuns}-${i}`}
            className="bg-card p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col sm:flex-row gap-4 sm:gap-5"
          >
            <div className="w-11 h-11 bg-accent rounded-full flex items-center justify-center font-bold text-foreground text-[14px] shrink-0">
              {ans.autorRaspuns?.charAt(0)}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-bold text-[15px]">{ans.autorRaspuns}</span>
                <span className="text-[10px] md:text-[11.5px] text-muted-foreground font-medium">
                  RĂSPUNS NOU
                </span>
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">
                  Q&amp;A
                </span>
              </div>
              <p className="text-[13px] md:text-[13.5px] text-gray-500 font-medium italic mb-1">
                Q: {ans.intrebare}
              </p>
              <p className="text-[13px] md:text-[13.5px] text-foreground font-semibold">
                {ans.raspuns}
              </p>
              <div className="flex gap-5 mt-3 text-[10.5px] font-black text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-red-400">
                  <Star className="size-4 text-amber-400" /> 0
                </div>
                <span className="cursor-pointer hover:text-primary">Raspunde</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
