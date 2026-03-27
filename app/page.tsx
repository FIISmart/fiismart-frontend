"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, GraduationCap, Sparkles } from "lucide-react";
import { CourseHeader } from "@/components/course-builder/course-header";
import { ModuleCard } from "@/components/course-builder/module-card";
import { CommentModeration } from "@/components/course-builder/comment-moderation";
import type { Course, Module, Comment } from "@/lib/course-types";
import { generateId } from "@/lib/course-types";
import { Toaster, toast } from "sonner";

// Use stable IDs to avoid hydration mismatch
const sampleComments: Comment[] = [
  {
    id: "comment-1",
    userId: "user1",
    userName: "Maria Ionescu",
    content: "Foarte bine explicat! Mulțumesc pentru acest curs.",
    createdAt: new Date("2026-03-26T10:00:00"),
    lessonId: "lesson-1",
    status: "pending",
  },
  {
    id: "comment-2",
    userId: "user2",
    userName: "Alexandru Popa",
    content: "La minutul 2:42, nu înțeleg de ce folosim acest tag. Puteți explica mai detaliat?",
    createdAt: new Date("2026-03-26T05:00:00"),
    lessonId: "lesson-1",
    status: "pending",
  },
  {
    id: "comment-3",
    userId: "user3",
    userName: "Elena Dumitrescu",
    content: "Excelent conținut! Abia aștept următorul modul.",
    createdAt: new Date("2026-03-25T10:00:00"),
    lessonId: "lesson-2",
    status: "approved",
  },
];

const initialCourse: Course = {
  id: "course-web-dev-101",
  title: "Introducere în Web Development",
  description:
    "Învață bazele dezvoltării web moderne cu HTML, CSS și JavaScript. Un curs complet pentru începători care doresc să își construiască prima aplicație web.",
  tags: ["Web", "HTML", "CSS", "JavaScript"],
  thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1280&h=720&fit=crop",
  instructor: {
    id: "instructor-1",
    name: "Prof. Andrei Popescu",
    title: "Senior Web Developer @ Google",
    avatar: undefined,
  },
  modules: [
    {
      id: "module-1",
      title: "Introducere & Setup",
      description: "Primii pași în dezvoltarea web",
      lessons: [
        {
          id: "lesson-1",
          title: "Bine ai venit la curs!",
          type: "video",
          content: "https://youtube.com/watch?v=example1",
          duration: 5,
          order: 0,
        },
        {
          id: "lesson-2",
          title: "Instalare VS Code",
          type: "video",
          content: "https://youtube.com/watch?v=example2",
          duration: 8,
          order: 1,
        },
        {
          id: "lesson-3",
          title: "Primul tău proiect",
          type: "markdown",
          content: "# Primul tău proiect\n\nÎn această lecție vom crea primul nostru fișier HTML.",
          duration: 10,
          order: 2,
        },
      ],
      quiz: {
        id: "quiz-1",
        title: "Quiz Modul 1",
        questions: [
          {
            id: "question-1",
            question: "Ce extensie are un fișier HTML?",
            options: [".html", ".css", ".js", ".txt"],
            correctAnswer: 0,
            explanation: "Fișierele HTML au întotdeauna extensia .html",
          },
        ],
      },
      order: 0,
    },
    {
      id: "module-2",
      title: "HTML Fundamentale",
      description: "Structura și tag-urile de bază ale HTML",
      lessons: [],
      order: 1,
    },
    {
      id: "module-3",
      title: "CSS Styling",
      description: "Stilizarea paginilor web",
      lessons: [],
      order: 2,
    },
  ],
  comments: sampleComments,
  status: "draft",
  createdAt: new Date("2026-03-20T10:00:00"),
  updatedAt: new Date("2026-03-26T10:00:00"),
};

export default function CourseBuilderPage() {
  const [course, setCourse] = useState<Course>(initialCourse);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const handleUpdateCourse = (updates: Partial<Course>) => {
    setCourse((prev) => ({ ...prev, ...updates, updatedAt: new Date() }));
  };

  const handleAddModule = () => {
    const newModule: Module = {
      id: generateId(),
      title: "Modul Nou",
      description: "",
      lessons: [],
      order: course.modules.length,
    };
    setCourse((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
      updatedAt: new Date(),
    }));
    toast.success("Modul adăugat cu succes!");
  };

  const handleUpdateModule = (moduleId: string, updatedModule: Module) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? updatedModule : m)),
      updatedAt: new Date(),
    }));
  };

  const handleDeleteModule = (moduleId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
      updatedAt: new Date(),
    }));
    setDeleteModuleId(null);
    toast.success("Modul șters cu succes!");
  };

  const handleUpdateComment = (commentId: string, status: Comment["status"]) => {
    setCourse((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.id === commentId ? { ...c, status } : c
      ),
    }));
    toast.success(
      status === "approved" ? "Comentariu aprobat!" : 
      status === "rejected" ? "Comentariu respins!" : 
      "Comentariu actualizat!"
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setCourse((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));
    toast.success("Comentariu șters!");
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCourse((prev) => ({ ...prev, status: "draft", updatedAt: new Date() }));
    setIsSaving(false);
    toast.success("Ciornă salvată cu succes!");
  };

  const handlePublish = () => {
    setPublishDialogOpen(true);
  };

  const confirmPublish = async () => {
    setIsSaving(true);
    setPublishDialogOpen(false);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCourse((prev) => ({ ...prev, status: "published", updatedAt: new Date() }));
    setIsSaving(false);
    toast.success("Curs publicat cu succes! 🎉");
  };

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const canPublish = course.title && course.modules.length > 0 && totalLessons > 0;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      
      <CourseHeader
        course={course}
        onUpdate={handleUpdateCourse}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
      />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="font-serif font-bold text-lg sm:text-xl">Module Curs</h2>
          </div>
          <div className="flex items-center gap-2">
            <CommentModeration
              comments={course.comments}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
            <Button onClick={handleAddModule} className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-sm">
              <Plus className="h-4 w-4" />
              <span>Adaugă Modul</span>
            </Button>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-3 sm:space-y-4">
          {course.modules.length === 0 ? (
            <div className="text-center py-10 sm:py-16 px-4 bg-card border border-border rounded-xl sm:rounded-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-base sm:text-lg mb-2">
                Începe să construiești cursul
              </h3>
              <p className="text-muted-foreground text-sm mb-4 sm:mb-6 max-w-md mx-auto">
                Adaugă primul tău modul pentru a începe să creezi conținut educațional
                captivant pentru studenții tăi.
              </p>
              <Button onClick={handleAddModule} className="gap-2 text-sm">
                <Plus className="h-4 w-4" />
                Adaugă Primul Modul
              </Button>
            </div>
          ) : (
            course.modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                moduleIndex={index}
                onUpdate={(updatedModule) =>
                  handleUpdateModule(module.id, updatedModule)
                }
                onDelete={() => setDeleteModuleId(module.id)}
              />
            ))
          )}
        </div>

        {/* Add Module Button (when modules exist) */}
        {course.modules.length > 0 && (
          <Button
            variant="outline"
            onClick={handleAddModule}
            className="w-full mt-4 gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Adaugă Modul Nou
          </Button>
        )}

        {/* Bottom Spacer */}
        <div className="h-20" />
      </main>

      {/* Delete Module Confirmation */}
      <AlertDialog
        open={deleteModuleId !== null}
        onOpenChange={() => setDeleteModuleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge Modulul</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi acest modul? Toate lecțiile și quiz-urile
              din acest modul vor fi șterse permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteModuleId && handleDeleteModule(deleteModuleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge Modulul
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Publică Cursul
            </AlertDialogTitle>
            <AlertDialogDescription>
              {canPublish ? (
                <>
                  Ești gata să publici <strong>{course.title}</strong>? Cursul va
                  deveni vizibil pentru toți studenții înscriși.
                  <div className="mt-4 p-3 bg-muted rounded-xl text-sm">
                    <div className="flex justify-between">
                      <span>Module:</span>
                      <strong>{course.modules.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Lecții:</span>
                      <strong>{totalLessons}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Quiz-uri:</span>
                      <strong>{course.modules.filter((m) => m.quiz).length}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-destructive">
                  Nu poți publica cursul încă. Asigură-te că ai:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    {!course.title && <li>Adăugat un titlu pentru curs</li>}
                    {course.modules.length === 0 && <li>Cel puțin un modul</li>}
                    {totalLessons === 0 && <li>Cel puțin o lecție</li>}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            {canPublish && (
              <AlertDialogAction onClick={confirmPublish}>
                Publică Acum
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
