"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
  Pencil,
  HelpCircle,
  Video,
  FileText,
  Code,
  BookOpen,
} from "lucide-react";
import type { Module, Lesson, Quiz } from "@/lib/course-types";
import { LessonItem, LessonEditor } from "./lesson-editor";
import { QuizEditor } from "./quiz-editor";

interface ModuleCardProps {
  module: Module;
  moduleIndex: number;
  onUpdate: (module: Module) => void;
  onDelete: () => void;
}

export function ModuleCard({ module, moduleIndex, onUpdate, onDelete }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(module.isExpanded ?? true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editDescription, setEditDescription] = useState(module.description || "");
  
  // Lesson editor state
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>();
  
  // Quiz editor state
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdate({ ...module, title: editTitle, description: editDescription });
      setIsEditing(false);
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

  const handleSaveLesson = (lesson: Lesson) => {
    let newLessons: Lesson[];
    
    if (editingLesson) {
      // Editing existing lesson
      newLessons = module.lessons.map((l) =>
        l.id === lesson.id ? lesson : l
      );
    } else {
      // Adding new lesson
      lesson.order = module.lessons.length;
      newLessons = [...module.lessons, lesson];
    }
    
    onUpdate({ ...module, lessons: newLessons });
    setLessonEditorOpen(false);
    setEditingLesson(undefined);
  };

  const handleDeleteLesson = (lessonId: string) => {
    const newLessons = module.lessons.filter((l) => l.id !== lessonId);
    onUpdate({ ...module, lessons: newLessons });
  };

  const handleSaveQuiz = (quiz: Quiz) => {
    onUpdate({ ...module, quiz });
    setQuizEditorOpen(false);
  };

  const handleRemoveQuiz = () => {
    onUpdate({ ...module, quiz: undefined });
    setQuizEditorOpen(false);
  };

  const totalDuration = module.lessons.reduce(
    (acc, lesson) => acc + (lesson.duration || 0),
    0
  );

  return (
    <>
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Module Header */}
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
                        placeholder="Titlu modul"
                        autoFocus
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="bg-card text-sm"
                        placeholder="Descriere opțională..."
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveTitle} className="text-sm">
                          Salvează
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-sm"
                          onClick={() => {
                            setIsEditing(false);
                            setEditTitle(module.title);
                            setEditDescription(module.description || "");
                          }}
                        >
                          Anulează
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <CollapsibleTrigger className="flex items-center gap-1.5 sm:gap-2 text-left w-full group">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-serif font-semibold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                          <span className="text-primary/60 mr-1 sm:mr-2">{moduleIndex + 1}.</span>
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </CollapsibleTrigger>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* Stats Badges - Hide on small mobile */}
                    <div className="hidden md:flex items-center gap-1.5 mr-1 sm:mr-2">
                      <Badge variant="secondary" className="gap-1 text-xs bg-accent/40">
                        <BookOpen className="h-3 w-3" />
                        {module.lessons.length}
                      </Badge>
                      {totalDuration > 0 && (
                        <Badge variant="secondary" className="gap-1 text-xs bg-secondary/30">
                          {totalDuration}m
                        </Badge>
                      )}
                      {module.quiz && (
                        <Badge variant="secondary" className="gap-1 text-xs bg-primary/20 text-primary">
                          <HelpCircle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editează Modulul
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleAddLesson}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adaugă Lecție
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setQuizEditorOpen(true)}>
                          <HelpCircle className="h-4 w-4 mr-2" />
                          {module.quiz ? "Editează Quiz" : "Adaugă Quiz"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={onDelete}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Șterge Modulul
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Lessons List */}
              <CollapsibleContent className="mt-3 sm:mt-4">
                <div className="space-y-2 ml-0 sm:ml-7">
                  {module.lessons.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 border-2 border-dashed border-border rounded-lg sm:rounded-xl">
                      <div className="flex justify-center gap-2 mb-2 sm:mb-3 text-muted-foreground">
                        <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3">
                        Nicio lecție adăugată încă
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddLesson}
                        className="gap-1.5 text-xs sm:text-sm"
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Adaugă Prima Lecție
                      </Button>
                    </div>
                  ) : (
                    <>
                      {module.lessons.map((lesson) => (
                        <LessonItem
                          key={lesson.id}
                          lesson={lesson}
                          onEdit={handleEditLesson}
                          onDelete={handleDeleteLesson}
                        />
                      ))}
                      
                      {/* Quiz indicator */}
                      {module.quiz && (
                        <button
                          onClick={() => setQuizEditorOpen(true)}
                          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl border border-primary/20 w-full hover:bg-primary/20 transition-colors"
                        >
                          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-primary/20 text-primary shrink-0">
                            <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{module.quiz.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {module.quiz.questions.length} întrebări
                            </p>
                          </div>
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        </button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddLesson}
                        className="w-full gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground mt-2"
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Adaugă Lecție
                      </Button>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Editors */}
      <LessonEditor
        lesson={editingLesson}
        onSave={handleSaveLesson}
        onCancel={() => {
          setLessonEditorOpen(false);
          setEditingLesson(undefined);
        }}
        isOpen={lessonEditorOpen}
      />

      <QuizEditor
        quiz={module.quiz}
        onSave={handleSaveQuiz}
        onCancel={() => setQuizEditorOpen(false)}
        onRemove={module.quiz ? handleRemoveQuiz : undefined}
        isOpen={quizEditorOpen}
      />
    </>
  );
}
