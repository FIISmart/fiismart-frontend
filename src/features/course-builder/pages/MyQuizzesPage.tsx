import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CalendarClock, HelpCircle, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuizEditor } from "@/features/course-builder/components/quiz-editor";
import { useAuth } from "@/features/auth/context/AuthContext";
import * as api from "@/lib/api";
import { generateId, type Quiz, type QuizQuestion } from "@/lib/course-types";
import {
  deleteCourseFinalQuiz,
  deleteLectureQuiz,
  deleteModuleQuiz,
  getTeacherCourseQuizzes,
  type MyQuiz,
  upsertCourseFinalQuiz,
  upsertLectureQuiz,
  upsertModuleQuiz,
} from "@/features/course-builder/services/my-quizzes.service";
import {
  aiQuizDraftSchema,
  type AiQuizDraftPayload,
} from "@/features/chat/services/aiDraft.schema";

/**
 * Map an AI quiz draft payload (chatbot tool-call result) into the FE
 * `Quiz` shape that `QuizEditor` consumes. Supports both `multiple_choice`
 * and `free_text` questions because the chatbot may emit either. We do not
 * use the shared `aiDraftToFeQuiz` mapper because it is hard-coded to
 * `multiple_choice` only.
 */
function aiDraftPayloadToQuiz(draft: AiQuizDraftPayload): Quiz {
  const questions: QuizQuestion[] = draft.questions.map((q): QuizQuestion => {
    if (q.type === "free_text") {
      return {
        id: generateId(),
        question: q.text,
        type: "free_text",
        correctAnswer: "",
        sampleAnswer: q.sampleAnswer ?? "",
        keyConcepts: q.keyConcepts ?? [],
        passThreshold: q.passThreshold,
        explanation: q.explanation,
      };
    }
    return {
      id: generateId(),
      question: q.text,
      type: "multiple_choice",
      options: q.options ?? ["", "", "", ""],
      correctAnswer: typeof q.correctIdx === "number" ? q.correctIdx : 0,
      explanation: q.explanation,
    };
  });
  return {
    id: generateId(),
    title: draft.title,
    passingScore: draft.passingScore ?? 70,
    timeLimit: draft.timeLimit ?? 30,
    shuffleQuestions: false,
    questions: questions.length > 0 ? questions : [],
  };
}

export default function MyQuizzesPage() {
  const { user } = useAuth();
  const teacherId = user?.id;
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<api.CourseAPI[]>([]);
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | undefined>();
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [activeQuizScope, setActiveQuizScope] = useState<string>("course_final");
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<MyQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(teacherId));
  const cancelledRef = useRef(false);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setIsLoading(true);
    try {
      const [courseItems, quizItems] = await Promise.all([
        api.getCoursesByTeacher(teacherId),
        getTeacherCourseQuizzes(teacherId),
      ]);
      if (cancelledRef.current) return;
      setCourses(courseItems);
      setQuizzes(quizItems);
      setSelectedCourseId((current) => current ?? courseItems[0]?.id ?? null);
    } catch (err) {
      if (!cancelledRef.current) {
        toast.error(err instanceof Error ? err.message : "Eroare la incarcarea quiz-urilor");
      }
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    cancelledRef.current = false;
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  // AI draft pickup: the chatbot navigates here with
  // `location.state.aiDraft = { type: "quiz", payload }`. Validate with zod,
  // map to the FE Quiz shape, and open QuizEditor pre-populated. We wait for
  // courses to load so the user has a course to attach the quiz to.
  const aiDraftHandledRef = useRef(false);
  useEffect(() => {
    if (aiDraftHandledRef.current) return;
    const aiDraft = (location.state as { aiDraft?: { type?: string; payload?: unknown } } | null)
      ?.aiDraft;
    if (!aiDraft || aiDraft.type !== "quiz") return;
    aiDraftHandledRef.current = true;

    const parsed = aiQuizDraftSchema.safeParse(aiDraft.payload);
    // Always clear the location state so a refresh doesn't re-trigger.
    navigate(location.pathname, { replace: true, state: {} });
    if (!parsed.success) {
      toast.error("Draft AI invalid — încercați din nou.");
      return;
    }

    if (courses.length === 0) {
      toast.error("Creează mai întâi un curs pentru a salva quiz-ul.");
      return;
    }
    const courseId = selectedCourseId ?? courses[0]?.id;
    if (!courseId) return;

    setActiveCourseId(courseId);
    setActiveModuleId(null);
    setActiveLectureId(null);
    setActiveQuizScope("course_final");
    setActiveQuizId(null);
    setActiveQuiz(aiDraftPayloadToQuiz(parsed.data));
    setEditorOpen(true);
  }, [location, navigate, courses, selectedCourseId]);

  const openCreate = () => {
    const courseId = selectedCourseId ?? courses[0]?.id;
    if (!courseId) {
      toast.error("Creeaza mai intai un curs.");
      return;
    }
    setActiveCourseId(courseId);
    setActiveModuleId(null);
    setActiveLectureId(null);
    setActiveQuizScope("course_final");
    setActiveQuizId(null);
    setActiveQuiz({
      id: "",
      title: "Quiz Nou",
      passingScore: 70,
      timeLimit: 30,
      shuffleQuestions: false,
      questions: [],
    });
    setEditorOpen(true);
  };

  const openEdit = (quiz: MyQuiz) => {
    setActiveCourseId(quiz.courseId);
    setActiveModuleId(quiz.moduleId ?? null);
    setActiveLectureId(quiz.lectureId ?? null);
    setActiveQuizScope(quiz.quizScope);
    setActiveQuizId(quiz.id);
    setActiveQuiz(quiz);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setActiveQuiz(undefined);
    setActiveQuizId(null);
    setActiveCourseId(null);
    setActiveModuleId(null);
    setActiveLectureId(null);
    setActiveQuizScope("course_final");
  };

  const handleSaveQuiz = async (quiz: Quiz) => {
    if (!activeCourseId) {
      toast.error("Alege cursul pentru quiz.");
      return;
    }

    try {
      let saved: MyQuiz;
      if (activeQuizScope === "module" && activeModuleId) {
        saved = await upsertModuleQuiz(activeCourseId, activeModuleId, quiz);
      } else if (activeQuizScope === "lecture" && activeModuleId && activeLectureId) {
        saved = await upsertLectureQuiz(activeCourseId, activeModuleId, activeLectureId, quiz);
      } else if (activeQuizScope === "course_final") {
        saved = await upsertCourseFinalQuiz(activeCourseId, quiz);
      } else {
        throw new Error("Context invalid pentru salvarea quiz-ului.");
      }
      const courseTitle = courses.find((course) => course.id === activeCourseId)?.title;
      const original = quizzes.find((item) => item.id === activeQuizId);
      const savedWithCourse = {
        ...saved,
        courseTitle,
        moduleTitle: original?.moduleTitle,
      };

      setQuizzes((prev) => {
        const withoutPrevious = prev.filter((item) => item.id !== activeQuizId);
        return [savedWithCourse, ...withoutPrevious].sort((a, b) => a.title.localeCompare(b.title));
      });
      closeEditor();
      toast.success("Quiz salvat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la salvarea quiz-ului");
    }
  };

  const confirmDelete = async () => {
    if (!deletingQuiz) return;
    try {
      if (deletingQuiz.quizScope === "module" && deletingQuiz.moduleId) {
        await deleteModuleQuiz(deletingQuiz.courseId, deletingQuiz.moduleId);
      } else if (
        deletingQuiz.quizScope === "lecture" &&
        deletingQuiz.moduleId &&
        deletingQuiz.lectureId
      ) {
        await deleteLectureQuiz(
          deletingQuiz.courseId,
          deletingQuiz.moduleId,
          deletingQuiz.lectureId,
        );
      } else if (deletingQuiz.quizScope === "course_final") {
        await deleteCourseFinalQuiz(deletingQuiz.courseId);
      } else {
        throw new Error("Context invalid pentru stergerea quiz-ului.");
      }
      setDeletingQuiz(null);
      toast.success("Quiz sters.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la stergerea quiz-ului");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-2xl">My Quizzes</h1>
                <p className="text-sm text-muted-foreground">
                  Biblioteca centrala de quiz-uri pentru profesor.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/professor/courses">
                  <ArrowLeft className="h-4 w-4" />
                  My Courses
                </Link>
              </Button>
              <Select
                value={selectedCourseId ?? undefined}
                onValueChange={setSelectedCourseId}
                disabled={courses.length === 0}
              >
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Alege cursul" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={openCreate} disabled={courses.length === 0} className="gap-2">
                <Plus className="h-4 w-4" />
                Quiz Nou
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quiz-uri totale</p>
                <p className="text-lg font-semibold">{quizzes.length}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Intrebari totale</p>
                <p className="text-lg font-semibold">
                  {quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <p className="text-sm text-muted-foreground mb-4">Se incarca quiz-urile...</p>
        )}

        {!isLoading && quizzes.length === 0 && (
          <div className="border border-dashed border-border rounded-2xl p-10 text-center bg-card/40">
            <HelpCircle className="h-10 w-10 text-primary/50 mx-auto mb-3" />
            <h2 className="font-serif font-semibold text-xl mb-2">Nu ai quiz-uri inca</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Creeaza un quiz central pentru unul dintre cursurile tale.
            </p>
            <Button onClick={openCreate} disabled={courses.length === 0} className="gap-2">
              <Plus className="h-4 w-4" />
              Creeaza Quiz
            </Button>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={`${quiz.courseId}-${quiz.id}`} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="font-serif font-semibold text-lg line-clamp-1">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {quiz.questions.length} intrebari
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {quiz.moduleTitle
                    ? `${quiz.courseTitle ?? "Curs"} - ${quiz.moduleTitle}`
                    : (quiz.courseTitle ?? "Quiz de curs")}
                </p>
              </CardContent>
              <CardFooter className="p-5 pt-0 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(quiz)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editeaza
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeletingQuiz(quiz)}
                  aria-label="Sterge quiz"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <QuizEditor
        quiz={activeQuiz}
        onSave={handleSaveQuiz}
        onCancel={closeEditor}
        isOpen={editorOpen}
        supportsWritten
      />

      <AlertDialog open={deletingQuiz !== null} onOpenChange={() => setDeletingQuiz(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sterge quiz-ul</AlertDialogTitle>
            <AlertDialogDescription>
              Esti sigur ca vrei sa stergi acest quiz din biblioteca profesorului?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuleaza</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white">
              Sterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
