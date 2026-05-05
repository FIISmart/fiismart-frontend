import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Plus, GraduationCap, Sparkles, LayoutPanelLeft, AlertTriangle, ArrowLeft, HelpCircle } from "lucide-react";
import { CourseHeader } from "@/features/course-builder/components/course-header";
import { ModuleCard } from "@/features/course-builder/components/module-card";
import { CommentModeration } from "@/features/course-builder/components/comment-moderation";
import { Spinner } from "@/components/ui/spinner";
import type { Course, Module } from "@/lib/course-types";
import { mapCourseToFE } from "@/lib/course-types";
import * as api from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Toaster, toast } from "sonner";
import { Link, useParams, useSearchParams } from "react-router-dom";

const pendingNewCourseCreations = new Map<string, Promise<api.CourseAPI>>();

type LoadError = {
  kind: "not-found" | "generic";
  message: string;
};

function isNotFoundError(err: unknown): boolean {
  // Prefer a typed status code if the error carries one, otherwise fall back
  // to substring match on the message (apiFetch throws plain Error today).
  const status = (err as { status?: number; statusCode?: number } | null)?.status
    ?? (err as { status?: number; statusCode?: number } | null)?.statusCode;
  if (status === 404) return true;
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("404") || msg.includes("not found") || msg.includes("nu a fost gas");
}

export default function CourseBuilderPage() {
  const { user } = useAuth();
  const teacherId = user?.id;
  const { courseId: routeCourseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);

  // ── Load Course & Modules on Mount ────────────────────

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    async function loadCourse() {
      try {
        const shouldCreateNew = searchParams.get("new") === "1";
        const newToken = searchParams.get("newToken") || "legacy-new-token";
        const selectedCourseId = routeCourseId ?? searchParams.get("courseId");
        let currentCourseApi: api.CourseAPI;

        if (shouldCreateNew) {
          const consumedTokensKey = "fiismart-consumed-new-course-tokens";
          const tokenToCourseKey = "fiismart-new-course-token-map";
          const consumedTokens = JSON.parse(
            sessionStorage.getItem(consumedTokensKey) || "[]"
          ) as string[];
          const tokenMap = JSON.parse(
            sessionStorage.getItem(tokenToCourseKey) || "{}"
          ) as Record<string, string>;
          const alreadyConsumed = consumedTokens.includes(newToken);

          if (alreadyConsumed && tokenMap[newToken]) {
            currentCourseApi = await api.getCourse(tokenMap[newToken]);
          } else {
            sessionStorage.setItem(
              consumedTokensKey,
              JSON.stringify([...consumedTokens, newToken].slice(-50))
            );
            let creationPromise = pendingNewCourseCreations.get(newToken);
            if (!creationPromise) {
              creationPromise = api.createCourse({
                title: "Curs Nou",
                description: "Adaugă o descriere...",
                teacherId: teacherId!,
                tags: [],
              });
              pendingNewCourseCreations.set(newToken, creationPromise);
            }
            currentCourseApi = await creationPromise;
            pendingNewCourseCreations.delete(newToken);
            sessionStorage.setItem(
              tokenToCourseKey,
              JSON.stringify({
                ...tokenMap,
                [newToken]: currentCourseApi.id,
              })
            );
          }

          // Pin URL to the created course id so subsequent state/effect updates
          // stay on the same course instead of falling back to another one.
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            params.delete("new");
            params.delete("newToken");
            params.set("courseId", currentCourseApi.id);
            const nextQuery = params.toString();
            const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
            window.history.replaceState(null, "", nextUrl);
          }
        } else if (selectedCourseId) {
          currentCourseApi = await api.getCourse(selectedCourseId);
        } else {
          const courses = await api.getCoursesByTeacher(teacherId!);
          if (courses.length > 0) {
            currentCourseApi = courses[0];
          } else {
            currentCourseApi = await api.createCourse({
              title: "Curs Nou",
              description: "Adaugă o descriere...",
              teacherId: teacherId!,
              tags: [],
            });
          }
        }

        const [commentsData, quizzesData] = await Promise.all([
          api.getComments(currentCourseApi.id).catch(() => [] as api.CommentAPI[]),
          api.getCourseBuilderQuizzes(currentCourseApi.id).catch(() => [] as api.ModuleQuizAPI[]),
        ]);

        if (cancelled) return;
        setCourse(mapCourseToFE(currentCourseApi, quizzesData, commentsData));
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load course:", err);
        const notFound = isNotFoundError(err);
        setCourse(null);
        setLoadError({
          kind: notFound ? "not-found" : "generic",
          message:
            err instanceof Error
              ? err.message
              : "A apărut o eroare la încărcarea cursului",
        });
        toast.error(
          notFound
            ? "Cursul nu a fost găsit"
            : "Eroare la încărcarea cursului"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadCourse();
    return () => {
      cancelled = true;
    };
  }, [routeCourseId, searchParams, teacherId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Toaster richColors position="top-right" />
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Spinner className="size-4" />
            <p>Se încarcă structura cursului...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    const notFound = loadError?.kind === "not-found";
    // Surface the underlying error to the console for debugging, but keep the
    // user-facing copy generic so we don't leak stack-ish strings into the UI.
    if (loadError && !notFound) {
      console.error("[course-builder] load failed:", loadError.message);
    }
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen bg-background flex items-center justify-center px-4"
      >
        <Toaster richColors position="top-right" />
        <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-8">
          <AlertTriangle className="h-12 w-12 text-destructive/80 mx-auto mb-4" />
          <h1 className="font-serif font-bold text-2xl mb-2">
            {notFound ? "Cursul nu a fost găsit" : "Nu am putut încărca cursul"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {notFound
              ? "Cursul pe care încerci să îl deschizi nu există sau a fost șters."
              : "A apărut o eroare neașteptată. Încearcă din nou mai târziu."}
          </p>
          <Button asChild className="gap-2">
            <Link to="/professor/courses">
              <ArrowLeft className="h-4 w-4" />
              Înapoi la cursurile mele
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Module Handlers ───────────────────────────────────

  const handleAddModule = async () => {
    try {
      const newModuleApi = await api.addModule(course.id, { title: "Modul Nou" });
      const newModule: Module = {
        id: newModuleApi.id,
        title: newModuleApi.title,
        description: newModuleApi.description,
        order: course.modules.length,
        lessons: [],
        quizzes: [],
        quiz: undefined,
      };
      setCourse(prev => prev ? { ...prev, modules: [...prev.modules, newModule] } : prev);
      toast.success("Modul adăugat!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la crearea modulului");
    }
  };

  const handleUpdateModuleInState = (updatedModule: Module) => {
    setCourse(prev => prev ? {
      ...prev,
      modules: prev.modules.map(m => m.id === updatedModule.id ? updatedModule : m)
    } : prev);
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await api.deleteModule(course.id, moduleId);
      setCourse(prev => prev ? {
        ...prev,
        modules: prev.modules.filter(m => m.id !== moduleId)
      } : prev);
      toast.success("Modul șters!");
    } catch (err) {
      toast.error("Eroare la ștergerea modulului");
    }
    setDeleteModuleId(null);
  };

  // ── Course Handlers ───────────────────────────────────

  const handleUpdateCourse = async (updates: Partial<Course>) => {
    try {
      const apiUpdates: any = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined) apiUpdates.description = updates.description;
      if (updates.tags !== undefined) apiUpdates.tags = updates.tags;
      if (updates.thumbnail !== undefined) apiUpdates.thumbnailUrl = updates.thumbnail || null;

      if (Object.keys(apiUpdates).length > 0) {
        await api.updateCourse(course.id, apiUpdates);
      }
      setCourse((prev) => prev ? { ...prev, ...updates, updatedAt: new Date() } : prev);
    } catch (err) {
      toast.error("Eroare la actualizarea cursului");
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await api.draftCourse(course.id);
      setCourse(prev => prev ? { ...prev, status: "draft" } : prev);
      toast.success("Ciornă salvată!");
    } catch (err) {
      toast.error("Eroare la salvare");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmPublish = async () => {
    setIsSaving(true);
    try {
      await api.publishCourse(course.id);
      setCourse(prev => prev ? { ...prev, status: "published" } : prev);
      toast.success("Curs publicat!");
    } catch (err) {
      toast.error("Eroare la publicare");
    } finally {
      setIsSaving(false);
      setPublishDialogOpen(false);
    }
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const canPublish = course.title && totalLessons > 0;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />

      <CourseHeader
        course={course}
        onUpdate={handleUpdateCourse}
        onSaveDraft={handleSaveDraft}
        onPublish={() => setPublishDialogOpen(true)}
        isSaving={isSaving}
      />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <LayoutPanelLeft className="h-6 w-6 text-primary" />
            <h2 className="font-serif font-bold text-xl">Module Curs</h2>
          </div>
          <div className="flex w-full sm:w-auto items-center justify-end gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to={`/professor/quizzes?courseId=${course.id}`}>
                <HelpCircle className="h-4 w-4" />
                My Quizzes
              </Link>
            </Button>
            <CommentModeration
              comments={course.comments}
              onUpdateComment={async (id, status) => {
                await api.updateCommentStatus(id, status);
                setCourse(prev => prev ? {
                  ...prev,
                  comments: prev.comments.map(c => c.id === id ? { ...c, status } : c)
                } : prev);
              }}
              onDeleteComment={async (id) => {
                await api.deleteComment(id);
                setCourse(prev => prev ? {
                  ...prev,
                  comments: prev.comments.filter(c => c.id !== id)
                } : prev);
              }}
            />
            <Button onClick={handleAddModule} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Modul Nou</span>
            </Button>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {course.modules.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <Sparkles className="h-12 w-12 text-primary/20 mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-lg mb-2">Organizează cursul pe module</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Creează primul modul pentru a grupa lecțiile și quiz-urile pe tematici.
              </p>
              <Button onClick={handleAddModule} className="gap-2">
                <Plus className="h-4 w-4" />
                Creează Primul Modul
              </Button>
            </div>
          ) : (
            course.modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                courseId={course.id}
                module={module}
                moduleIndex={index}
                onUpdate={handleUpdateModuleInState}
                onDelete={() => setDeleteModuleId(module.id)}
              />
            ))
          )}
        </div>

        {course.modules.length > 0 && (
          <Button variant="outline" onClick={handleAddModule} className="w-full mt-6 gap-2 border-dashed">
            <Plus className="h-4 w-4" /> Adaugă Modul Nou
          </Button>
        )}

        <div className="h-20" />
      </main>

      {/* Delete Module Confirmation */}
      <AlertDialog open={deleteModuleId !== null} onOpenChange={() => setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge Modulul</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi acest modul și toate lecțiile din el?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteModuleId && handleDeleteModule(deleteModuleId)} className="bg-destructive text-white">
              Șterge Tot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publică Cursul</AlertDialogTitle>
            <AlertDialogDescription>
              {canPublish ? `Ești gata să publici ${course.title}?` : "Adaugă titlu și lecții înainte de a publica."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            {canPublish && <AlertDialogAction onClick={confirmPublish}>Publică</AlertDialogAction>}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
