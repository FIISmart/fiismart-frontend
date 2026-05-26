/**
 * ToolCallCard — card pentru un tool call invocat de chatbot.
 *
 * Dispatch după `toolCall.name`:
 *   - buildFullCourse / orice tool cu progress events → ToolProgressCard
 *     (checklist live + CTA "Vezi cursul" la final).
 *   - Tool-urile de modificare (addModule, updateLecture, ...) → one-liner
 *     compact cu rezultatul (sau eroarea).
 *   - createQuizDraft / createCourseDraft (legacy) → card cu CTA "Deschide
 *     editor" către pagina de quiz/curs (comportament neschimbat).
 *
 * Cât timp `tc.result` lipsește (BE încă rulează handler-ul) afișăm un
 * indicator de "se generează…"; după ce `result` sosește, devine activ
 * butonul CTA.
 */
import { CheckCircle2, FileQuestion, GraduationCap, Loader2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ToolCall, ToolName } from "../types";
import { useChat } from "../context/ChatContext";
import { ToolProgressCard } from "./ToolProgressCard";

interface Props {
  toolCall: ToolCall;
}

/** Tool-urile de modificare a unui curs (compact one-liner result). */
const MODIFY_TOOLS: ReadonlySet<ToolName> = new Set<ToolName>([
  "addModule",
  "updateModule",
  "deleteModule",
  "reorderModules",
  "addLecture",
  "updateLecture",
  "deleteLecture",
  "reorderLectures",
  "addModuleQuiz",
  "updateModuleQuiz",
  "deleteModuleQuiz",
]);

const MODIFY_TOOL_LABELS: Record<string, string> = {
  addModule: "Adăugat modul",
  updateModule: "Actualizat modul",
  deleteModule: "Șters modul",
  reorderModules: "Reordonate module",
  addLecture: "Adăugată lecție",
  updateLecture: "Actualizată lecție",
  deleteLecture: "Ștearsă lecție",
  reorderLectures: "Reordonate lecții",
  addModuleQuiz: "Adăugat quiz",
  updateModuleQuiz: "Actualizat quiz",
  deleteModuleQuiz: "Șters quiz",
};

function ModifyToolLine({ toolCall }: { toolCall: ToolCall }) {
  const isReady = toolCall.result !== undefined && toolCall.result !== null;
  const errorMsg =
    typeof toolCall.result?.error === "string"
      ? (toolCall.result.error as string)
      : undefined;

  const label = MODIFY_TOOL_LABELS[toolCall.name] ?? toolCall.name;

  // Subiect contextual: titlul din args sau result, dacă există.
  const subject =
    (toolCall.args?.title as string | undefined) ??
    (toolCall.result?.title as string | undefined) ??
    (toolCall.args?.moduleId as string | undefined) ??
    (toolCall.args?.lectureId as string | undefined);

  if (errorMsg) {
    return (
      <article className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
        <XCircle className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <span className="font-medium">{label} eșuat:</span> {errorMsg}
        </span>
      </article>
    );
  }

  return (
    <article className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-xs">
      {isReady ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
      )}
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span>
        {subject ? ` "${subject}"` : ""}
      </span>
    </article>
  );
}

export function ToolCallCard({ toolCall }: Props) {
  const navigate = useNavigate();
  const { close } = useChat();
  const isReady = toolCall.result !== undefined && toolCall.result !== null;

  // 1) buildFullCourse SAU orice tool care a primit deja progress events
  //    → afișăm ToolProgressCard (checklist + CTA).
  if (
    toolCall.name === "buildFullCourse" ||
    (toolCall.progress?.length ?? 0) > 0
  ) {
    return <ToolProgressCard toolCall={toolCall} />;
  }

  // 2) Tool-uri de modificare (single tool_result, fără progress) → one-liner.
  if (MODIFY_TOOLS.has(toolCall.name)) {
    return <ModifyToolLine toolCall={toolCall} />;
  }

  const handleOpen = () => {
    const payload = toolCall.result;
    close();
    if (toolCall.name === "createQuizDraft") {
      navigate("/professor/quizzes", {
        state: { aiDraft: { type: "quiz", payload } },
      });
    } else if (toolCall.name === "createCourseDraft") {
      navigate("/professor/courses", {
        state: { aiDraft: { type: "course", payload } },
      });
    }
  };

  if (toolCall.name === "createQuizDraft") {
    const topic =
      (toolCall.args?.topic as string | undefined) ??
      (toolCall.result?.title as string | undefined) ??
      "Subiect nespecificat";
    const count =
      (toolCall.args?.questionCount as number | undefined) ??
      (toolCall.result?.questions?.length as number | undefined);
    return (
      <article className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
        <header className="flex items-center gap-2">
          <FileQuestion className="size-4 text-primary" />
          <h3 className="text-sm font-medium">
            {isReady ? "Quiz draft creat" : "Generez quiz draft…"}
          </h3>
          {!isReady && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
        </header>
        <p className="mt-1 text-xs text-muted-foreground">
          {topic}
          {typeof count === "number" && ` · ${count} întrebări`}
        </p>
        {isReady && (
          <div className="mt-3">
            <Button size="sm" onClick={handleOpen}>
              Deschide editor
            </Button>
          </div>
        )}
      </article>
    );
  }

  if (toolCall.name === "createCourseDraft") {
    const subject =
      (toolCall.args?.subject as string | undefined) ??
      (toolCall.result?.title as string | undefined) ??
      "Subiect nespecificat";
    const moduleCount =
      (toolCall.args?.moduleCount as number | undefined) ??
      (toolCall.result?.modules?.length as number | undefined);
    return (
      <article className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
        <header className="flex items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          <h3 className="text-sm font-medium">
            {isReady ? "Curs draft creat" : "Generez curs draft…"}
          </h3>
          {!isReady && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
        </header>
        <p className="mt-1 text-xs text-muted-foreground">
          {subject}
          {typeof moduleCount === "number" && ` · ${moduleCount} module`}
        </p>
        {isReady && (
          <div className="mt-3">
            <Button size="sm" onClick={handleOpen}>
              Deschide editor
            </Button>
          </div>
        )}
      </article>
    );
  }

  // Fallback pentru tool-uri necunoscute (forward-compat).
  return (
    <article className="rounded-lg border bg-muted/40 p-3 text-sm">
      <p className="font-medium">{toolCall.name}</p>
      <pre className="mt-1 max-h-32 overflow-auto text-xs text-muted-foreground">
        {JSON.stringify(toolCall.args, null, 2)}
      </pre>
    </article>
  );
}
