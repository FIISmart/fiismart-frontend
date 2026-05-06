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
  Trash2,
} from "lucide-react";
import type { Lesson, Module, Quiz } from "@/lib/course-types";
import { LessonEditor, LessonItem } from "./lesson-editor";
import { QuizEditor } from "./quiz-editor";
import { QuizLibraryPicker } from "./quiz-library-picker";
import * as api from "@/lib/api";
import { deleteModuleQuiz, upsertModuleQuiz, type MyQuiz } from "@/features/course-builder/services/my-quizzes.service";
import { toast } from "sonner";

interface ModuleCardProps {
  courseId: string;
  module: Module;
  moduleIndex: number;
  onUpdate: (module: Module) => void;
  onDelete: () => void;
}

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
        <CircleHelp className="h-4 w-4" />
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
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(quiz.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ModuleCard({
  courseId,
  module,
  moduleIndex,
  onUpdate,
  onDelete,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(module.isExpanded ?? true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editDescription, setEditDescription] = useState(module.description || "");
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>();
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const moduleItems = getModuleContentItems(module);

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
      if (editingLesson) {
        await api.updateLectureInModule(courseId, module.id, lesson.id, {
          title: lesson.title,
          videoUrl: lesson.content,
          durationSecs: (lesson.duration || 0) * 60,
        });

        const newLessons = module.lessons.map((l) => (l.id === lesson.id ? { ...lesson, order: l.order } : l));
        onUpdate({ ...module, lessons: newLessons });
        toast.success("Lectie actualizata");
      } else {
        const created = await api.addLectureToModule(courseId, module.id, {
          title: lesson.title,
          videoUrl: lesson.content,
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
    setLessonEditorOpen(false);
    setEditingLesson(undefined);
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
    setQuizEditorOpen(true);
  };

  const openQuizFlow = () => {
    if (module.quiz) {
      openQuizEditor(module.quiz);
    } else {
      setPickerOpen(true);
    }
  };

  const openInPlaceQuizEditor = () => {
    setPickerOpen(false);
    openQuizEditor(undefined);
  };

  const handleAttachExistingQuiz = async (source: MyQuiz) => {
    try {
      const saved = await upsertModuleQuiz(courseId, module.id, source);
      const nextQuiz = { ...saved, order: moduleItems.length };
      onUpdate(reindexModule({ ...module, quiz: nextQuiz }));
      setPickerOpen(false);
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
      setQuizEditorOpen(false);
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
      setQuizEditorOpen(false);
      setEditingQuiz(undefined);
      toast.success("Quiz eliminat din modul.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Eroare la stergerea quiz-ului");
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
              <GripVertical className="h-5 w-5" />
            </button>

            <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="flex-1">
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
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
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
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}><Pencil className="mr-2 h-4 w-4" /> Redenumire</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLessonEditorOpen(true)}><Plus className="mr-2 h-4 w-4" /> Adauga Lectie</DropdownMenuItem>
                        <DropdownMenuItem onClick={openQuizFlow}><CircleHelp className="mr-2 h-4 w-4" /> {module.quiz ? "Editeaza Quiz" : "Adauga Quiz"}</DropdownMenuItem>
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
                            onEdit={(l) => { setEditingLesson(l); setLessonEditorOpen(true); }}
                            onDelete={handleDeleteLesson}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border-dashed border border-border"
                      onClick={() => setLessonEditorOpen(true)}
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
        onCancel={() => { setLessonEditorOpen(false); setEditingLesson(undefined); }}
        isOpen={lessonEditorOpen}
      />
      <QuizEditor
        quiz={editingQuiz}
        onSave={handleSaveModuleQuiz}
        onCancel={() => { setQuizEditorOpen(false); setEditingQuiz(undefined); }}
        onRemove={module.quiz ? () => handleRemoveModuleQuiz() : undefined}
        isOpen={quizEditorOpen}
      />
      <QuizLibraryPicker
        isOpen={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        onSelect={handleAttachExistingQuiz}
        onCreateNew={openInPlaceQuizEditor}
      />
    </>
  );
}
