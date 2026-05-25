import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onStart: () => void;
  quizTitle: string;
  questionCount?: number;
  durationMinutes?: number;
  passScore?: number;
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  if (!isIos) return false;
  const isInAppOrOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(ua);
  return !isInAppOrOtherBrowser;
}

export default function QuizStartPage({
  onStart,
  quizTitle,
  questionCount = 10,
  durationMinutes = 10,
  passScore = 60,
}: Props) {
  const shouldShowIosBanner = useMemo(() => isIosSafari(), []);
  const [iosBannerDismissed, setIosBannerDismissed] = useState(false);
  const showIosBanner = shouldShowIosBanner && !iosBannerDismissed;

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="bg-primary text-primary-foreground text-sm font-medium px-6 h-[32px] flex items-center justify-center rounded-full mb-6 shadow-sm">
        FIISmart Learning
      </div>

      <div className="bg-card w-full max-w-[512px] rounded-2xl shadow-lg relative overflow-hidden flex flex-col items-center">
        <div className="h-[8px] w-full bg-gradient-to-r from-accent via-secondary to-primary"></div>

        <div className="p-8 w-full flex flex-col items-center">
          <div className="w-[80px] h-[80px] bg-background rounded-xl flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-[24px] font-bold text-foreground mb-2 text-center">
            {quizTitle}
          </h1>

          <p className="text-[16px] text-muted-foreground leading-[24px] text-center mb-8 max-w-[368px]">
            Test your knowledge with this quick quiz.
          </p>

          <div className="flex w-full gap-4 mb-8">
            <div className="flex-1 h-[78px] bg-accent/20 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-foreground">{questionCount}</span>
              <span className="text-[12px] text-muted-foreground">Questions</span>
            </div>

            <div className="flex-1 h-[78px] bg-accent/20 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-foreground">{durationMinutes} min</span>
              <span className="text-[12px] text-muted-foreground">Duration</span>
            </div>

            <div className="flex-1 h-[78px] bg-accent/20 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-foreground">{passScore}%</span>
              <span className="text-[12px] text-muted-foreground">Pass Score</span>
            </div>
          </div>

          {showIosBanner && (
            <div className="w-full mb-4 rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex items-start gap-2">
              <span className="flex-1">
                Quiz works best on desktop. Mobile Safari has limited fullscreen
                support — anti-cheat may not engage reliably.
              </span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIosBannerDismissed(true)}
                aria-label="Dismiss iOS Safari notice"
                className="text-amber-900/70 hover:text-amber-900 font-bold h-auto p-0"
              >
                ×
              </Button>
            </div>
          )}

          <Button
            onClick={onStart}
            size="lg"
            className="w-full bg-gradient-to-r from-secondary to-primary font-semibold text-[16px]"
          >
            Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}