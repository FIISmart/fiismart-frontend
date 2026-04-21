"use client";

import { Suspense, useState, useEffect } from "react";
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
import { Plus, GraduationCap, Sparkles, LayoutPanelLeft } from "lucide-react";
import { CourseHeader } from "@/components/course-builder/course-header";
import { ModuleCard } from "@/components/course-builder/module-card";
import { CommentModeration } from "@/components/course-builder/comment-moderation";
import type { Course, Module, Comment } from "@/lib/course-types";
import { mapCourseToFE } from "@/lib/course-types";
import * as api from "@/lib/api";
import { Toaster, toast } from "sonner";
import { useSearchParams } from "next/navigation";

// Hardcoded for now — in production, comes from auth context
const TEACHER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const pendingNewCourseCreations = new Map<string, Promise<api.CourseAPI>>();

export default function CourseBuilderPage() {
  return (
    <Suspense fallback={null}>
      <CourseBuilderPageInner />
    </Suspense>
  );
}

function CourseBuilderPageInner() {
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);

  // ── Load Course & Modules on Mount ────────────────────

  useEffect(() => {
    async function loadCourse() {
      try {
        const shouldCreateNew = searchParams.get("new") === "1";
        const newToken = searchParams.get("newToken") || "legacy-new-token";
        const selectedCourseId = searchParams.get("courseId");
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
                teacherId: TEACHER_ID,
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
          const courses = await api.getCoursesByTeacher(TEACHER_ID);
          if (courses.length > 0) {
            currentCourseApi = courses[0];
          } else {
            currentCourseApi = await api.createCourse({
              title: "Curs Nou",
              description: "Adaugă o descriere...",
              teacherId: TEACHER_ID,
              tags: [],
            });
          }
        }

        let commentsData: api.CommentAPI[] = [];
        try {
          commentsData = await api.getComments(currentCourseApi.id);
        } catch { /* No comments */ }

        // CourseResponse already includes modules -> mapCourseToFE maps them inline
        setCourse(mapCourseToFE(currentCourseApi, null, commentsData));
      } catch (err) {
        console.error("Failed to load course:", err);
        toast.error("Eroare la încărcarea cursului");
      } finally {
        setIsLoading(false);
      }
    }
    loadCourse();
  }, [searchParams]);

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Se încarcă structura cursului...</p>
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
          <div className="flex items-center gap-2">
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