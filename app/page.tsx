"use client";

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
import { Plus, GraduationCap, Sparkles } from "lucide-react";
import { CourseHeader } from "@/components/course-builder/course-header";
import { LessonItem, LessonEditor } from "@/components/course-builder/lesson-editor";
import { QuizEditor } from "@/components/course-builder/quiz-editor";
import { CommentModeration } from "@/components/course-builder/comment-moderation";
import type { Course, Lesson, Quiz, Comment } from "@/lib/course-types";
import { mapCourseToFE, mapLectureToLesson, mapQuizToFE } from "@/lib/course-types";
import * as api from "@/lib/api";
import { Toaster, toast } from "sonner";

// Hardcoded for now — in production, comes from auth context
const TEACHER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

export default function CourseBuilderPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  // Lesson editor state
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>();

  // Quiz editor state
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);

  // Load course on mount — fetch first course by teacher, or create one
  useEffect(() => {
    async function loadCourse() {
      try {
        const courses = await api.getCoursesByTeacher(TEACHER_ID);
        if (courses.length > 0) {
          const courseData = courses[0];
          let quizData = null;
          try {
            quizData = await api.getQuiz(courseData.id);
          } catch {
            // No quiz yet
          }
          let commentsData: api.CommentAPI[] = [];
          try {
            commentsData = await api.getComments(courseData.id);
          } catch {
            // No comments
          }
          setCourse(mapCourseToFE(courseData, quizData, commentsData));
        } else {
          // Create a new draft course
          const newCourse = await api.createCourse({
            title: "Curs Nou",
            description: "Adaugă o descriere...",
            teacherId: TEACHER_ID,
            tags: [],
          });
          setCourse(mapCourseToFE(newCourse, null, []));
        }
      } catch (err) {
        console.error("Failed to load course:", err);
        toast.error("Eroare la încărcarea cursului");
      } finally {
        setIsLoading(false);
      }
    }
    loadCourse();
  }, []);

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Se încarcă cursul...</p>
        </div>
      </div>
    );
  }

  const handleUpdateCourse = async (updates: Partial<Course>) => {
    try {
      const apiUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined) apiUpdates.description = updates.description;
      if (updates.tags !== undefined) apiUpdates.tags = updates.tags;
      if (updates.thumbnail !== undefined) apiUpdates.thumbnailUrl = updates.thumbnail || null;

      if (Object.keys(apiUpdates).length > 0) {
        await api.updateCourse(course.id, apiUpdates as Parameters<typeof api.updateCourse>[1]);
      }
      setCourse((prev) => prev ? { ...prev, ...updates, updatedAt: new Date() } : prev);
    } catch (err) {
      toast.error("Eroare la actualizarea cursului");
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(undefined);
    setLessonEditorOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonEditorOpen(true);
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    try {
      const durationSecs = (lesson.duration || 0) * 60;

      if (editingLesson) {
        // Update existing
        await api.updateLecture(course.id, lesson.id, {
          title: lesson.title,
          videoUrl: lesson.content || undefined,
          durationSecs,
          order: lesson.order,
        });
        setCourse((prev) => prev ? {
          ...prev,
          lessons: prev.lessons.map((l) => (l.id === lesson.id ? lesson : l)),
          updatedAt: new Date(),
        } : prev);
        toast.success("Lecție actualizată!");
      } else {
        // Create new
        const created = await api.addLecture(course.id, {
          title: lesson.title,
          videoUrl: lesson.content || undefined,
          durationSecs,
          order: course.lessons.length,
        });
        const newLesson = mapLectureToLesson(created);
        // Keep the FE type info
        newLesson.type = lesson.type;
        newLesson.content = lesson.content;
        setCourse((prev) => prev ? {
          ...prev,
          lessons: [...prev.lessons, newLesson],
          updatedAt: new Date(),
        } : prev);
        toast.success("Lecție adăugată!");
      }
    } catch (err) {
      toast.error("Eroare la salvarea lecției");
    }
    setLessonEditorOpen(false);
    setEditingLesson(undefined);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await api.deleteLecture(course.id, lessonId);
      setCourse((prev) => prev ? {
        ...prev,
        lessons: prev.lessons.filter((l) => l.id !== lessonId),
        updatedAt: new Date(),
      } : prev);
      toast.success("Lecție ștearsă!");
    } catch (err) {
      toast.error("Eroare la ștergerea lecției");
    }
    setDeleteLessonId(null);
  };

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      const created = await api.createOrUpdateQuiz(course.id, {
        title: quiz.title,
        passingScore: quiz.passingScore || 70,
        timeLimit: quiz.timeLimit || 30,
        shuffleQuestions: quiz.shuffleQuestions || false,
        questions: quiz.questions.map((q) => ({
          text: q.question,
          type: "multiple_choice",
          points: 1,
          options: q.options,
          correctIdx: q.correctAnswer,
          explanation: q.explanation,
        })),
      });
      setCourse((prev) => prev ? { ...prev, quiz: mapQuizToFE(created), updatedAt: new Date() } : prev);
      toast.success("Quiz salvat!");
    } catch (err) {
      toast.error("Eroare la salvarea quiz-ului");
    }
    setQuizEditorOpen(false);
  };

  const handleRemoveQuiz = async () => {
    try {
      await api.deleteQuiz(course.id);
      setCourse((prev) => prev ? { ...prev, quiz: undefined, updatedAt: new Date() } : prev);
      toast.success("Quiz șters!");
    } catch (err) {
      toast.error("Eroare la ștergerea quiz-ului");
    }
    setQuizEditorOpen(false);
  };

  const handleUpdateComment = async (commentId: string, status: Comment["status"]) => {
    try {
      await api.updateCommentStatus(commentId, status);
      setCourse((prev) => prev ? {
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId ? { ...c, status } : c
        ),
      } : prev);
      toast.success(
        status === "approved" ? "Comentariu aprobat!" :
        status === "rejected" ? "Comentariu respins!" :
        "Comentariu actualizat!"
      );
    } catch (err) {
      toast.error("Eroare la actualizarea comentariului");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      setCourse((prev) => prev ? {
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      } : prev);
      toast.success("Comentariu șters!");
    } catch (err) {
      toast.error("Eroare la ștergerea comentariului");
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await api.draftCourse(course.id);
      setCourse((prev) => prev ? { ...prev, status: "draft", updatedAt: new Date() } : prev);
      toast.success("Ciornă salvată cu succes!");
    } catch (err) {
      toast.error("Eroare la salvarea ciornei");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    setPublishDialogOpen(true);
  };

  const confirmPublish = async () => {
    setIsSaving(true);
    setPublishDialogOpen(false);
    try {
      await api.publishCourse(course.id);
      setCourse((prev) => prev ? { ...prev, status: "published", updatedAt: new Date() } : prev);
      toast.success("Curs publicat cu succes!");
    } catch (err) {
      toast.error("Eroare la publicarea cursului");
    } finally {
      setIsSaving(false);
    }
  };

  const totalLessons = course.lessons.length;
  const totalDuration = course.lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
  const canPublish = course.title && totalLessons > 0;

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
            <h2 className="font-serif font-bold text-lg sm:text-xl">Lecții Curs</h2>
          </div>
          <div className="flex items-center gap-2">
            <CommentModeration
              comments={course.comments}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuizEditorOpen(true)}
              className="gap-1.5 text-sm"
            >
              {course.quiz ? "Editează Quiz" : "Adaugă Quiz"}
            </Button>
            <Button onClick={handleAddLesson} className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-sm">
              <Plus className="h-4 w-4" />
              <span>Adaugă Lecție</span>
            </Button>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3 sm:space-y-4">
          {course.lessons.length === 0 ? (
            <div className="text-center py-10 sm:py-16 px-4 bg-card border border-border rounded-xl sm:rounded-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-base sm:text-lg mb-2">
                Începe să construiești cursul
              </h3>
              <p className="text-muted-foreground text-sm mb-4 sm:mb-6 max-w-md mx-auto">
                Adaugă prima lecție pentru a începe să creezi conținut educațional
                captivant pentru studenții tăi.
              </p>
              <Button onClick={handleAddLesson} className="gap-2 text-sm">
                <Plus className="h-4 w-4" />
                Adaugă Prima Lecție
              </Button>
            </div>
          ) : (
            <>
              {course.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={handleEditLesson}
                  onDelete={(id) => setDeleteLessonId(id)}
                />
              ))}

              {/* Quiz indicator */}
              {course.quiz && (
                <button
                  onClick={() => setQuizEditorOpen(true)}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl border border-primary/20 w-full hover:bg-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-primary/20 text-primary shrink-0">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{course.quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.quiz.questions.length} întrebări
                    </p>
                  </div>
                </button>
              )}
            </>
          )}
        </div>

        {/* Add Lesson Button (when lessons exist) */}
        {course.lessons.length > 0 && (
          <Button
            variant="outline"
            onClick={handleAddLesson}
            className="w-full mt-4 gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Adaugă Lecție Nouă
          </Button>
        )}

        <div className="h-20" />
      </main>

      {/* Lesson Editor Dialog */}
      <LessonEditor
        lesson={editingLesson}
        onSave={handleSaveLesson}
        onCancel={() => {
          setLessonEditorOpen(false);
          setEditingLesson(undefined);
        }}
        isOpen={lessonEditorOpen}
      />

      {/* Quiz Editor Dialog */}
      <QuizEditor
        quiz={course.quiz}
        onSave={handleSaveQuiz}
        onCancel={() => setQuizEditorOpen(false)}
        onRemove={course.quiz ? handleRemoveQuiz : undefined}
        isOpen={quizEditorOpen}
      />

      {/* Delete Lesson Confirmation */}
      <AlertDialog
        open={deleteLessonId !== null}
        onOpenChange={() => setDeleteLessonId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge Lecția</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi această lecție? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLessonId && handleDeleteLesson(deleteLessonId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge Lecția
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
                      <span>Lecții:</span>
                      <strong>{totalLessons}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Durată totală:</span>
                      <strong>{totalDuration} min</strong>
                    </div>
                    {course.quiz && (
                      <div className="flex justify-between">
                        <span>Quiz:</span>
                        <strong>{course.quiz.questions.length} întrebări</strong>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-destructive">
                  Nu poți publica cursul încă. Asigură-te că ai:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    {!course.title && <li>Adăugat un titlu pentru curs</li>}
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
