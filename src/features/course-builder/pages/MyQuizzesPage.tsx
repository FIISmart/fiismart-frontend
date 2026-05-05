import { useEffect, useState } from "react";
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
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { QuizEditor } from "@/features/course-builder/components/quiz-editor";
import { useAuth } from "@/features/auth/context/AuthContext";
import * as api from "@/lib/api";
import type { Quiz } from "@/lib/course-types";
import {
  deleteModuleQuiz,
  deleteCourseQuiz,
  getTeacherCourseQuizzes,
  type MyQuiz,
  upsertModuleQuiz,
  upsertCourseQuiz,
} from "@/features/course-builder/services/my-quizzes.service";

export default function MyQuizzesPage() {
  const { user } = useAuth();
  const teacherId = user?.id;
  const [courses, setCourses] = useState<api.CourseAPI[]>([]);
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | undefined>();
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeQuizScope, setActiveQuizScope] = useState<string>("course");
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<MyQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(teacherId));

  const load = async () => {
    if (!teacherId) return;
    setIsLoading(true);
    try {
      const [courseItems, quizItems] = await Promise.all([
        api.getCoursesByTeacher(teacherId),
        getTeacherCourseQuizzes(teacherId),
      ]);
      setCourses(courseItems);
      setQuizzes(quizItems);
      setSelectedCourseId((current) => current ?? courseItems[0]?.id ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la incarcarea quiz-urilor");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        const [courseItems, quizItems] = await Promise.all([
          api.getCoursesByTeacher(teacherId),
          getTeacherCourseQuizzes(teacherId),
        ]);
        if (cancelled) return;
        setCourses(courseItems);
        setQuizzes(quizItems);
        setSelectedCourseId((current) => current ?? courseItems[0]?.id ?? null);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Eroare la incarcarea quiz-urilor");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  const openCreate = () => {
    const courseId = selectedCourseId ?? courses[0]?.id;
    if (!courseId) {
      toast.error("Creeaza mai intai un curs.");
      return;
    }
    setActiveCourseId(courseId);
    setActiveModuleId(null);
    setActiveQuizScope("course");
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
    setActiveQuizScope("course");
  };

  const handleSaveQuiz = async (quiz: Quiz) => {
    if (!activeCourseId) {
      toast.error("Alege cursul pentru quiz.");
      return;
    }

    try {
      const saved =
        activeQuizScope === "module" && activeModuleId
          ? await upsertModuleQuiz(activeCourseId, activeModuleId, quiz)
          : await upsertCourseQuiz(activeCourseId, quiz);
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
    if (deletingQuiz.quizScope === "module" && deletingQuiz.moduleId) {
      await deleteModuleQuiz(deletingQuiz.courseId, deletingQuiz.moduleId);
    } else {
      await deleteCourseQuiz(deletingQuiz.courseId);
    }
    setDeletingQuiz(null);
    toast.success("Quiz sters.");
    await load();
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
