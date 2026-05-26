/**
 * ToolProgressCard — afișează progresul unui tool care emite `tool_progress`
 * (de ex. `buildFullCourse`). Listează fiecare pas ca o linie cu check icon
 * + mesajul, cu spinner pe ultima linie cât timp tool-ul rulează. Sus
 * arătăm un progress bar (step/total) iar la final un CTA "Vezi cursul"
 * pentru `buildFullCourse`.
 *
 * Layout-ul folosește componentele shadcn (Card / ScrollArea / Progress /
 * Button) cu același stil ca restul cardurilor din chat.
 */
import { CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ToolCall, ToolName } from "../types";
import { useChat } from "../context/ChatContext";

interface Props {
  toolCall: ToolCall;
}

/** Titluri scurte în română pentru fiecare tool care raportează progres. */
const TOOL_TITLES: Partial<Record<ToolName, string>> = {
  buildFullCourse: "Construire curs",
  addModule: "Adaugare modul",
  updateModule: "Actualizare modul",
  deleteModule: "Stergere modul",
  reorderModules: "Reordonare module",
  addLecture: "Adaugare lectie",
  updateLecture: "Actualizare lectie",
  deleteLecture: "Stergere lectie",
  reorderLectures: "Reordonare lectii",
  addModuleQuiz: "Adaugare quiz",
  updateModuleQuiz: "Actualizare quiz",
  deleteModuleQuiz: "Stergere quiz",
};

export function ToolProgressCard({ toolCall }: Props) {
  const navigate = useNavigate();
  const { close } = useChat();
  const isReady = toolCall.result !== undefined && toolCall.result !== null;
  const progress = toolCall.progress ?? [];
  const latest = progress[progress.length - 1];

  // Progress bar value: dacă avem cel puțin un eveniment de progres
  // calculăm step/total. Dacă tool-ul s-a terminat (isReady) afișăm 100%.
  const pct = isReady
    ? 100
    : latest && latest.total > 0
      ? Math.min(100, Math.round((latest.step / latest.total) * 100))
      : 5;

  const title = TOOL_TITLES[toolCall.name] ?? toolCall.name;

  const courseId =
    toolCall.name === "buildFullCourse"
      ? (toolCall.result?.courseId as string | undefined)
      : undefined;

  const handleOpenCourse = () => {
    if (!courseId) return;
    close();
    navigate(`/professor/courses/${courseId}`);
  };

  // Sumar opțional din rezultat (titlu curs + counts) pentru buildFullCourse.
  const summary =
    toolCall.name === "buildFullCourse" && isReady
      ? {
          courseTitle: toolCall.result?.title as string | undefined,
          moduleCount: toolCall.result?.moduleCount as number | undefined,
          lectureCount: toolCall.result?.lectureCount as number | undefined,
          quizCount: toolCall.result?.quizCount as number | undefined,
        }
      : null;

  return (
    <article className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
      <header className="flex items-center gap-2">
        {isReady ? (
          <CheckCircle2 className="size-4 text-emerald-600" />
        ) : (
          <Loader2 className="size-4 animate-spin text-primary" />
        )}
        <h3 className="text-sm font-medium">{title}</h3>
        {latest && (
          <span className="ml-auto text-xs text-muted-foreground">
            {Math.min(latest.step, latest.total)}/{latest.total}
          </span>
        )}
      </header>

      <div className="mt-2">
        <Progress value={pct} className="h-1.5" />
      </div>

      {progress.length > 0 && (
        <ScrollArea className="mt-3 max-h-[200px] pr-3">
          <ul className="space-y-1.5">
            {progress.map((entry, idx) => {
              const isLast = idx === progress.length - 1;
              const showSpinner = isLast && !isReady;
              return (
                <li
                  key={`${entry.ts ?? idx}-${idx}`}
                  className="flex items-start gap-2 text-xs"
                >
                  {showSpinner ? (
                    <Loader2 className="mt-0.5 size-3 shrink-0 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                  )}
                  <span className="text-muted-foreground">{entry.message}</span>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}

      {summary && (
        <p className="mt-3 text-xs text-muted-foreground">
          {summary.courseTitle ? `"${summary.courseTitle}" — ` : ""}
          {summary.moduleCount ?? 0} module · {summary.lectureCount ?? 0} lecții ·{" "}
          {summary.quizCount ?? 0} quiz-uri
        </p>
      )}

      {toolCall.name === "buildFullCourse" && courseId && (
        <div className="mt-3">
          <Button size="sm" onClick={handleOpenCourse}>
            Vezi cursul
          </Button>
        </div>
      )}
    </article>
  );
}
