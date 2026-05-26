/**
 * ToolProgressCard — afișează progresul unui tool care emite `tool_progress`
 * (de ex. `buildFullCourse`). Layout-ul este compact:
 *   - antet (icon + titlu + step/total)
 *   - bara de progres
 *   - rândul "curent" — ultimul mesaj de progres
 *   - toggle "Arată toți pașii (N)" → ScrollArea cu listă completă
 *   - sumar opțional (titlu curs + counts)
 *   - CTA "Vezi cursul" (doar pentru `buildFullCourse`)
 *
 * Notă: shadcn ScrollArea folosește height 100% intern, așa că folosim
 * `h-[...]` fix (nu `max-h-`) pentru a-l constrânge. Toate elementele sunt
 * stivuite în articulul cardului — nu există elemente poziționate absolut
 * care să iasă din card.
 */
import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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
  addModule: "Adăugare modul",
  updateModule: "Actualizare modul",
  deleteModule: "Ștergere modul",
  reorderModules: "Reordonare module",
  addLecture: "Adăugare lecție",
  updateLecture: "Actualizare lecție",
  deleteLecture: "Ștergere lecție",
  reorderLectures: "Reordonare lecții",
  addModuleQuiz: "Adăugare quiz",
  updateModuleQuiz: "Actualizare quiz",
  deleteModuleQuiz: "Ștergere quiz",
};

export function ToolProgressCard({ toolCall }: Props) {
  const navigate = useNavigate();
  const { close } = useChat();
  const [expanded, setExpanded] = useState(false);

  const isReady = toolCall.result !== undefined && toolCall.result !== null;
  const progress = toolCall.progress ?? [];
  const latest = progress[progress.length - 1];

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

  const summary =
    toolCall.name === "buildFullCourse" && isReady
      ? {
          courseTitle: toolCall.result?.title as string | undefined,
          moduleCount: toolCall.result?.moduleCount as number | undefined,
          lectureCount: toolCall.result?.lectureCount as number | undefined,
          quizCount: toolCall.result?.quizCount as number | undefined,
        }
      : null;

  const canExpand = progress.length > 1;

  return (
    <article className="w-full overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
      <header className="flex items-center gap-2">
        {isReady ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        ) : (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        )}
        <h3 className="truncate text-sm font-medium">{title}</h3>
        {latest && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {Math.min(latest.step, latest.total)}/{latest.total}
          </span>
        )}
      </header>

      <div className="mt-2">
        <Progress value={pct} className="h-1.5" />
      </div>

      {/* Linia curentă — vizibilă mereu cât timp NU e expandat */}
      {latest && !expanded && (
        <div className="mt-3 flex items-start gap-2 text-xs">
          {isReady ? (
            <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-600" />
          ) : (
            <Loader2 className="mt-0.5 size-3 shrink-0 animate-spin text-primary" />
          )}
          <span className="min-w-0 flex-1 break-words text-muted-foreground">
            {latest.message}
          </span>
        </div>
      )}

      {/* Toggle expand/collapse */}
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3" />
              Ascunde pașii
            </>
          ) : (
            <>
              <ChevronDown className="size-3" />
              Arată toți pașii ({progress.length})
            </>
          )}
        </button>
      )}

      {/* Lista completă — vizibilă doar când expandat. Folosim h-[240px] fix
          (≈ 10 linii la text-xs) pentru a constrânge ScrollArea-ul. */}
      {expanded && progress.length > 0 && (
        <ScrollArea className="mt-2 h-[240px] w-full rounded-md border bg-muted/30 p-2">
          <ul className="space-y-1.5 pr-3">
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
                  <span className="min-w-0 flex-1 break-words text-muted-foreground">
                    {entry.message}
                  </span>
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
          <Button size="sm" onClick={handleOpenCourse} className="w-full sm:w-auto">
            Vezi cursul
          </Button>
        </div>
      )}
    </article>
  );
}
