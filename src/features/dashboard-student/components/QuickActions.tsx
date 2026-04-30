import { BookOpen, Play } from "lucide-react";
import type { ContinueStudy } from "../types";

interface QuickActionsProps {
  continueStudy: ContinueStudy | null;
}

/**
 * Two side-by-side CTAs: continue last viewed course (when available)
 * and a permanent "Find a Tutor" prompt.
 */
export function QuickActions({ continueStudy }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {continueStudy && (
        <div className="p-6 md:p-8 rounded-[20px] bg-gradient-to-r from-[#9b8ec7] to-[#bda6ce] flex items-center gap-6 border border-white/20 shadow-sm cursor-pointer hover:opacity-95 transition-all">
          <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white shrink-0">
            <Play fill="white" size={18} className="ml-1" />
          </div>
          <div>
            <h3 className="font-bold text-white text-[16px] md:text-[17px]">
              Continuă Învățarea
            </h3>
            <p className="text-white/80 text-[13px] md:text-[13.5px] font-medium">
              {continueStudy.titluCurs}
            </p>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 rounded-[20px] bg-gradient-to-r from-[#b4d3d9] to-[#2dd4bf] flex items-center gap-6 border border-white/20 shadow-sm cursor-pointer hover:opacity-95 transition-all">
        <div className="w-12 h-12 bg-white/50 backdrop-blur-md rounded-xl flex items-center justify-center text-[#1a1a2e] shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="font-bold text-[#1a1a2e] text-[16px] md:text-[17px]">
            Găsește un Tutore
          </h3>
          <p className="text-[#1a1a2e]/60 text-[12px] md:text-[13px] font-semibold">
            Ai nevoie de ajutor suplimentar?
          </p>
        </div>
      </div>
    </div>
  );
}
