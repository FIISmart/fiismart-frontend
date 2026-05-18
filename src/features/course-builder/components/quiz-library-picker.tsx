import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Library, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getTeacherCourseQuizzes,
  type MyQuiz,
} from "@/features/course-builder/services/my-quizzes.service";

interface QuizLibraryPickerProps {
  isOpen: boolean;
  onCancel: () => void;
  onSelect: (quiz: MyQuiz) => void;
  onCreateNew?: () => void;
}

function buildContextLabel(quiz: MyQuiz): string {
  const courseTitle = quiz.courseTitle ?? "Curs";
  if (quiz.quizScope === "module") {
    return `${courseTitle} — ${quiz.moduleTitle ?? "Modul"}`;
  }
  if (quiz.quizScope === "lecture") {
    return `${courseTitle} — ${quiz.moduleTitle ?? "Lecție"}`;
  }
  if (quiz.quizScope === "course_final") {
    return `${courseTitle} — Quiz final`;
  }
  return courseTitle;
}

export function QuizLibraryPicker({
  isOpen,
  onCancel,
  onSelect,
  onCreateNew,
}: QuizLibraryPickerProps) {
  const { user } = useAuth();
  const teacherId = user?.id;
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!teacherId) {
      setQuizzes([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getTeacherCourseQuizzes(teacherId)
      .then((items) => {
        if (cancelled) return;
        setQuizzes(items);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(
          err instanceof Error ? err.message : "Eroare la încărcarea quiz-urilor",
        );
        setQuizzes([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, teacherId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[640px] max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              Alege quiz din bibliotecă
            </DialogTitle>
            {onCreateNew && (
              <Button
                size="sm"
                variant="default"
                className="gap-2"
                onClick={onCreateNew}
              >
                <Plus className="h-4 w-4" />
                Creează quiz nou
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Se încarcă quiz-urile...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center bg-muted/20">
              <p className="text-sm text-muted-foreground mb-3">
                Nu ai niciun quiz în biblioteca ta.
              </p>
              <Button asChild variant="link" className="text-muted-foreground">
                <Link to="/professor/quizzes">Vezi pagina Quiz Builder →</Link>
              </Button>
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {quizzes.map((quiz) => (
                <li
                  key={`${quiz.courseId}-${quiz.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {quiz.questions.length} întrebări
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {buildContextLabel(quiz)}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => onSelect(quiz)}>
                    Selectează
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Anulează
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
