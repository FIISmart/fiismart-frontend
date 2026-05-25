/**
 * ToolCallCard — card pentru un tool call invocat de chatbot.
 *
 * Două tool-uri suportate (vezi planul Phase 3.2):
 *   - createQuizDraft   → navighează la `/professor/quizzes` (MyQuizzesPage)
 *                         cu state-ul `{ aiDraft: { type: "quiz", payload } }`;
 *                         pagina deschide `QuizEditor` pre-populat cu draft-ul.
 *   - createCourseDraft → navighează la `/professor/courses` (CoursesListPage)
 *                         cu state-ul `{ aiDraft: { type: "course", payload } }`;
 *                         pagina creează cursul folosind metadata-ul din draft.
 *
 * Cât timp `tc.result` lipsește (BE încă rulează handler-ul) afișăm un
 * indicator de "se generează…"; după ce `result` sosește, devine activ
 * butonul CTA.
 */
import { FileQuestion, GraduationCap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ToolCall } from "../types";
import { useChat } from "../context/ChatContext";

interface Props {
  toolCall: ToolCall;
}

export function ToolCallCard({ toolCall }: Props) {
  const navigate = useNavigate();
  const { close } = useChat();
  const isReady = toolCall.result !== undefined && toolCall.result !== null;

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
