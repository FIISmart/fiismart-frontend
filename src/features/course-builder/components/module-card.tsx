import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Lesson, Module, Quiz } from "@/lib/course-types";
import { LessonEditor, LessonItem } from "./lesson-editor";
import { QuizEditor } from "./quiz-editor";
import { QuizLibraryPicker } from "./quiz-library-picker";
import { AiGeneratePdfDialog } from "./ai-generate-pdf-dialog";
import * as api from "@/lib/api";
import {
  deleteLectureQuiz,
  deleteModuleQuiz,
  upsertLectureQuiz,
  upsertModuleQuiz,
  type MyQuiz,
} from "@/features/course-builder/services/my-quizzes.service";
import { aiDraftToFeQuiz } from "@/features/course-builder/services/ai.mappers";
import type { AiQuizDraft } from "@/features/course-builder/services/ai.service";
import { toast } from "sonner";

interface ModuleCardProps {
  courseId: string;
  module: Module;
  moduleIndex: number;
  isExpanded: boolean;
  onExpandedChange: (open: boolean) => void;
  onUpdate: (module: Module) => void;
  onDelete: () => void;
  onCourseRefresh?: () => Promise<void>;
}

type LessonEditorState =
  | { mode: "create" }
  | { mode: "edit"; lessonId: string };

type ModuleContentItem =
  | { type: "lesson"; id: string; order: number; lesson: Lesson }
  | { type: "quiz"; id: string; order: number; quiz: Quiz };

function getModuleContentItems(module: Module): ModuleContentItem[] {
  const lessons = module.lessons.map((lesson, index) => ({
    type: "lesson" as const,
    id: lesson.id,
    order: lesson.order ?? index,
    lesson,
  }));
  const quizItems = module.quiz
    ? [{ type: "quiz" as const, id: module.quiz.id, order: module.quiz.order ?? lessons.length, quiz: module.quiz }]
    : [];

  return [...lessons, ...quizItems].sort((a, b) => a.order - b.order);
}

function reorderItems(items: ModuleContentItem[], draggedId: string, targetId: string) {
  const from = items.findIndex((item) => item.id === draggedId);
  const to = items.findIndex((item) => item.id === targetId);
  if (from < 0 || to < 0 || from === to) return items;

  const next = [...items];
  const [dragged] = next.splice(from, 1);
  next.splice(to, 0, dragged);
  return next.map((item, index) => ({ ...item, order: index }));
}

function QuizItem({
  quiz,
  onEdit,
  onDelete,
}: {
  quiz: Quiz;
  onEdit: (quiz: Quiz) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border group hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
        <CircleHelp className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{quiz.title}</p>
        <p className="text-xs text-muted-foreground">
          Quiz {quiz.questions.length > 0 && `• ${quiz.questions.length} întrebări`}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(quiz)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(quiz.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ModuleCard({
  courseId,
  module,
  moduleIndex,
  isExpanded,
  onExpandedChange,
  onUpdate,
  onDelete,
  onCourseRefresh,
}: ModuleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editDescription, setEditDescription] = useState(module.description || "");
  const [lessonEditorState, setLessonEditorState] = useState<LessonEditorState | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>();
  const [activeModuleQuizId, setActiveModuleQuizId] = useState<string | null>(null);
  const [activeLessonQuizKey, setActiveLessonQuizKey] = useState<string | null>(null);
  const [pickerModuleId, setPickerModuleId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const moduleItems = getModuleContentItems(module);
  const editingLesson = lessonEditorState?.mode === "edit"
    ? module.lessons.find((lesson) => lesson.id === lessonEditorState.lessonId)
    : undefined;
  const editingLessonId = lessonEditorState?.mode === "edit"
    ? lessonEditorState.lessonId
    : null;
  const activeLessonQuizLessonId =
    activeLessonQuizKey?.startsWith(`${module.id}:`)
      ? activeLessonQuizKey.slice(module.id.length + 1)
      : null;
  const editingLessonQuiz = activeLessonQuizLessonId
    ? module.lessons.find((lesson) => lesson.id === activeLessonQuizLessonId)
    : undefined;

  const applyOrder = (items: ModuleContentItem[]) => {
    const quizItem = items.find((item) => item.type === "quiz");
    onUpdate({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        order: items.find((item) => item.type === "lesson" && item.id === lesson.id)?.order ?? lesson.order,
      })),
      quiz: module.quiz && quizItem
        ? { ...module.quiz, order: quizItem.order }
        : module.quiz,
    });
  };

  const reindexModule = (nextModule: Module): Module => {
    const items = getModuleContentItems(nextModule).map((item, index) => ({ ...item, order: index }));
    const quizItem = items.find((item) => item.type === "quiz");

    return {
      ...nextModule,
      lessons: nextModule.lessons.map((lesson) => ({
        ...lesson,
        order: items.find((item) => item.type === "lesson" && item.id === lesson.id)?.order ?? lesson.order,
      })),
      quiz: nextModule.quiz && quizItem
        ? { ...nextModule.quiz, order: quizItem.order }
        : nextModule.quiz,
    };
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) {
      toast.error("Titlul modulului nu poate fi gol");
      return;
    }

    try {
      const updatedModuleData = await api.updateModule(courseId, module.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });

      onUpdate({
        ...module,
        title: updatedModuleData.title,
        description: updatedModuleData.description,
      });

      setIsEditing(false);
      toast.success("Modul actualizat");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la salvarea modulului");
    }
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    try {
      if (editingLessonId) {
        await api.updateLectureInModule(courseId, module.id, editingLessonId, {
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          videoUrl: lesson.content,
          pdfUrl: lesson.type === "pdf" ? lesson.content : undefined,
          durationSecs: (lesson.duration || 0) * 60,
        });

        const newLessons = module.lessons.map((l) =>
          l.id === editingLessonId
            ? { ...l, ...lesson, id: editingLessonId, order: l.order, quiz: l.quiz }
            : l,
        );
        onUpdate({ ...module, lessons: newLessons });
        toast.success("Lectie actualizata");
      } else {
        const created = await api.addLectureToModule(courseId, module.id, {
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          videoUrl: lesson.content,
          pdfUrl: lesson.type === "pdf" ? lesson.content : undefined,
          order: moduleItems.length,
          durationSecs: (lesson.duration || 0) * 60,
        });

        onUpdate({
          ...module,
          lessons: [...module.lessons, { ...lesson, id: created.id, order: moduleItems.length }],
        });
        toast.success("Lectie adaugata");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la salvarea lectiei");
    }
    setLessonEditorState(null);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await api.deleteLectureFromModule(courseId, module.id, lessonId);
      onUpdate(reindexModule({ ...module, lessons: module.lessons.filter((l) => l.id !== lessonId) }));
      toast.success("Lectie stearsa");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la stergerea lectiei");
    }
  };

  const openQuizEditor = (quiz?: Quiz) => {
    setEditingQuiz(quiz ?? {
      id: "",
      title: "Quiz Modul",
      order: moduleItems.length,
      passingScore: 70,
      timeLimit: 30,
      shuffleQuestions: false,
      questions: [],
    });
    setActiveModuleQuizId(quiz?.id ?? "new");
  };

  const openQuizFlow = () => {
    if (module.quiz) {
      openQuizEditor(module.quiz);
    } else {
      setPickerModuleId(module.id);
    }
  };

  const openInPlaceQuizEditor = () => {
    setPickerModuleId(null);
    openQuizEditor(undefined);
  };

  const handleAttachExistingQuiz = async (source: MyQuiz) => {
    try {
      const saved = await upsertModuleQuiz(courseId, module.id, source);
      const nextQuiz = { ...saved, order: moduleItems.length };
      onUpdate(reindexModule({ ...module, quiz: nextQuiz }));
      onCourseRefresh?.().catch((err) => console.error("Course refetch failed:", err));
      setPickerModuleId(null);
      toast.success("Quiz adăugat din bibliotecă.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la atașarea quiz-ului");
    }
  };

  const handleSaveModuleQuiz = async (quiz: Quiz) => {
    try {
      const saved = await upsertModuleQuiz(courseId, module.id, {
        ...quiz,
        order: editingQuiz?.order ?? moduleItems.length,
      });
      const nextQuiz = { ...saved, order: editingQuiz?.order ?? moduleItems.length };
      onUpdate(reindexModule({ ...module, quiz: nextQuiz }));
      onCourseRefresh?.().catch((err) => console.error("Course refetch failed:", err));
      setActiveModuleQuizId(null);
      setEditingQuiz(undefined);
      toast.success("Quiz salvat.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la salvarea quiz-ului");
    }
  };

  const handleRemoveModuleQuiz = async () => {
    try {
      await deleteModuleQuiz(courseId, module.id);
      onUpdate(reindexModule({ ...module, quiz: undefined }));
      onCourseRefresh?.().catch((err) => console.error("Course refetch failed:", err));
      setActiveModuleQuizId(null);
      setEditingQuiz(undefined);
      toast.success("Quiz eliminat din modul.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la stergerea quiz-ului");
    }
  };

  const openLessonQuizEditor = (lesson: Lesson) => {
    setActiveLessonQuizKey(`${module.id}:${lesson.id}`);
  };

  const closeLessonQuizEditor = () => {
    setActiveLessonQuizKey(null);
  };

  const updateLessonQuizInState = (lessonId: string, quiz?: Quiz) => {
    onUpdate({
      ...module,
      lessons: module.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, quiz } : lesson,
      ),
    });
  };

  const handleSaveLessonQuiz = async (quiz: Quiz) => {
    if (!editingLessonQuiz) return;

    try {
      const saved = await upsertLectureQuiz(courseId, module.id, editingLessonQuiz.id, quiz);
      updateLessonQuizInState(editingLessonQuiz.id, saved);
      onCourseRefresh?.().catch((err) => console.error("Course refetch failed:", err));
      closeLessonQuizEditor();
      toast.success("Quiz salvat.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la salvarea quiz-ului");
    }
  };

  const handleRemoveLessonQuiz = async (lesson: Lesson) => {
    try {
      await deleteLectureQuiz(courseId, module.id, lesson.id);
      updateLessonQuizInState(lesson.id, undefined);
      onCourseRefresh?.().catch((err) => console.error("Course refetch failed:", err));
      if (editingLessonQuiz?.id === lesson.id) closeLessonQuizEditor();
      toast.success("Quiz eliminat din lectie.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la stergerea quiz-ului");
    }
  };

  const handleAiAccept = async (summary: string, draft: AiQuizDraft) => {
    const lessonTitle = draft.title?.trim() || "Rezumat AI";
    const order = module.lessons.length;
    const feQuiz = aiDraftToFeQuiz(draft, "Quiz AI");

    try {
      const createdLecture = await api.addLectureToModule(courseId, module.id, {
        title: lessonTitle,
        type: "markdown",
        content: summary,
        videoUrl: summary,
        order,
        durationSecs: 0,
      });

      const persistedLessonId = createdLecture.id;

      let savedQuiz: Quiz | undefined;
      try {
        savedQuiz = await upsertLectureQuiz(courseId, module.id, persistedLessonId, feQuiz);
      } catch (quizErr) {
        console.error(quizErr);
        // Be explicit: the lesson DID save. Only the quiz failed. Without
        // this, the user sees a generic error and assumes the whole flow
        // was rolled back (it wasn't — they'd find a quiz-less lesson on
        // the next refresh and think the AI didn't produce one).
        toast.error(
          "Lectia a fost salvata, dar quiz-ul nu — incearca din editorul de quiz.",
        );
      }

      const newLesson: Lesson = {
        id: persistedLessonId,
        title: lessonTitle,
        type: "markdown",
        content: summary,
        order,
        // Use only the BE-confirmed quiz (or undefined on partial failure).
        // The local draft (feQuiz) has a client-generated id that won't
        // match anything in the BE — keeping it would mislead the editor.
        quiz: savedQuiz,
      };

      onUpdate({
        ...module,
        lessons: [...module.lessons, newLesson],
      });
      onCourseRefresh?.().catch((refreshErr) =>
        console.error("Course refetch failed:", refreshErr),
      );

      if (savedQuiz) {
        toast.success("Lectie si quiz generate cu AI");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la generarea cu AI");
      // No rollback per spec; refresh to reconcile any partial state.
      onCourseRefresh?.().catch((refreshErr) =>
        console.error("Course refetch failed:", refreshErr),
      );
    }
  };

  const handleDropOnItem = (targetId: string) => {
    if (!draggedItemId) return;
    applyOrder(reorderItems(moduleItems, draggedItemId, targetId));
    setDraggedItemId(null);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4">
        <div className="p-3 sm:p-4 border-b border-border bg-muted/30">
          <div className="flex items-start gap-2 sm:gap-3">
            <button className="mt-1 cursor-grab text-muted-foreground hover:text-foreground hidden sm:block">
              <GripVertical className="size-5" />
            </button>

            <Collapsible open={isExpanded} onOpenChange={onExpandedChange} className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2 sm:space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-serif font-semibold text-base sm:text-lg bg-card"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveTitle}>Salveaza</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Anuleaza</Button>
                      </div>
                    </div>
                  ) : (
                    <CollapsibleTrigger className="flex items-center gap-1.5 sm:gap-2 text-left w-full group">
                      {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                      <div className="min-w-0">
                        <h3 className="font-serif font-semibold text-base sm:text-lg truncate">
                          <span className="text-primary/60 mr-2">{moduleIndex + 1}.</span>
                          {module.title}
                        </h3>
                      </div>
                    </CollapsibleTrigger>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}><Pencil className="mr-2 h-4 w-4" /> Redenumire</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLessonEditorState({ mode: "create" })}><Plus className="mr-2 h-4 w-4" /> Adauga Lectie</DropdownMenuItem>
                        <DropdownMenuItem onClick={openQuizFlow}><CircleHelp className="mr-2 h-4 w-4" /> {module.quiz ? "Editeaza Quiz" : "Adauga Quiz"}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAiDialogOpen(true)}><Sparkles className="mr-2 h-4 w-4" /> Genereaza cu AI ✨</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Sterge</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              <CollapsibleContent className="mt-4">
                <div className="space-y-2 ml-7">
                  {moduleItems.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      draggable
                      onDragStart={() => setDraggedItemId(item.id)}
                      onDragEnd={() => setDraggedItemId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDropOnItem(item.id)}
                      className="flex items-center gap-2"
                    >
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                      <div className={`min-w-0 flex-1 ${draggedItemId === item.id ? "opacity-50" : ""}`}>
                        {item.type === "lesson" ? (
                          <LessonItem
                            lesson={item.lesson}
                            onEdit={(l) => setLessonEditorState({ mode: "edit", lessonId: l.id })}
                            onDelete={handleDeleteLesson}
                            onEditQuiz={openLessonQuizEditor}
                            onDeleteQuiz={handleRemoveLessonQuiz}
                          />
                        ) : (
                          <QuizItem
                            quiz={item.quiz}
                            onEdit={openQuizEditor}
                            onDelete={() => handleRemoveModuleQuiz()}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border-dashed border border-border"
                      onClick={() => setLessonEditorState({ mode: "create" })}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Lectie Noua
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border-dashed border border-border"
                      onClick={openQuizFlow}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {module.quiz ? "Editeaza Quiz" : "Quiz Nou"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border-dashed border border-border"
                      onClick={() => setAiDialogOpen(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Genereaza cu AI ✨
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      <LessonEditor
        lesson={editingLesson}
        onSave={handleSaveLesson}
        onCancel={() => setLessonEditorState(null)}
        isOpen={lessonEditorState?.mode === "create" || editingLesson !== undefined}
      />
      <QuizEditor
        quiz={editingQuiz}
        onSave={handleSaveModuleQuiz}
        onCancel={() => { setActiveModuleQuizId(null); setEditingQuiz(undefined); }}
        onRemove={module.quiz ? () => handleRemoveModuleQuiz() : undefined}
        isOpen={activeModuleQuizId !== null}
      />
      <QuizEditor
        quiz={editingLessonQuiz?.quiz}
        onSave={handleSaveLessonQuiz}
        onCancel={closeLessonQuizEditor}
        onRemove={editingLessonQuiz?.quiz ? () => handleRemoveLessonQuiz(editingLessonQuiz) : undefined}
        isOpen={activeLessonQuizKey !== null && editingLessonQuiz !== undefined}
        supportsWritten
      />
      <QuizLibraryPicker
        isOpen={pickerModuleId === module.id}
        onCancel={() => setPickerModuleId(null)}
        onSelect={handleAttachExistingQuiz}
        onCreateNew={openInPlaceQuizEditor}
      />
      <AiGeneratePdfDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onAccept={handleAiAccept}
        existingPdfs={module.lessons
          .filter((lesson) => lesson.type === "pdf" && !!lesson.content)
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title || "PDF fara titlu",
            url: lesson.content,
          }))}
      />
    </>
  );
}
