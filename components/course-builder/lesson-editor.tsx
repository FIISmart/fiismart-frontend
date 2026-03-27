"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Video, FileText, Code, Clock, GripVertical, Trash2, Pencil } from "lucide-react";
import type { Lesson, LessonType } from "@/lib/course-types";
import { generateId } from "@/lib/course-types";

interface LessonEditorProps {
  lesson?: Lesson;
  onSave: (lesson: Lesson) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const lessonTypeIcons: Record<LessonType, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  markdown: <Code className="h-4 w-4" />,
};

const lessonTypeLabels: Record<LessonType, string> = {
  video: "Video",
  pdf: "PDF Document",
  markdown: "Markdown/Text",
};

export function LessonEditor({ lesson, onSave, onCancel, isOpen }: LessonEditorProps) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [type, setType] = useState<LessonType>(lesson?.type || "video");
  const [content, setContent] = useState(lesson?.content || "");
  const [duration, setDuration] = useState(lesson?.duration?.toString() || "");

  const handleSave = () => {
    const newLesson: Lesson = {
      id: lesson?.id || generateId(),
      title,
      type,
      content,
      duration: duration ? parseInt(duration) : undefined,
      order: lesson?.order || 0,
    };
    onSave(newLesson);
  };

  const isValid = title.trim() !== "" && content.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-serif text-lg sm:text-xl">
            {lesson ? "Editează Lecția" : "Adaugă Lecție Nouă"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Titlu Lecție</Label>
            <Input
              id="lesson-title"
              placeholder="ex: Introducere în HTML"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Tip Conținut</Label>
            <Select value={type} onValueChange={(v) => setType(v as LessonType)}>
              <SelectTrigger className="bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["video", "pdf", "markdown"] as LessonType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      {lessonTypeIcons[t]}
                      {lessonTypeLabels[t]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-content">
              {type === "video" ? "URL Video (YouTube, Vimeo, etc.)" : 
               type === "pdf" ? "URL PDF" : 
               "Conținut Markdown"}
            </Label>
            {type === "markdown" ? (
              <Textarea
                id="lesson-content"
                placeholder="Scrie conținutul în format Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] bg-muted font-mono text-sm"
              />
            ) : (
              <Input
                id="lesson-content"
                placeholder={type === "video" ? "https://youtube.com/watch?v=..." : "https://example.com/document.pdf"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-muted"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Durată (minute)
            </Label>
            <Input
              id="lesson-duration"
              type="number"
              placeholder="ex: 15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-muted w-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {lesson ? "Salvează Modificările" : "Adaugă Lecția"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LessonItemProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
}

export function LessonItem({ lesson, onEdit, onDelete }: LessonItemProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg sm:rounded-xl border border-border group hover:border-primary/30 transition-colors">
      <button className="cursor-grab text-muted-foreground hover:text-foreground hidden sm:block">
        <GripVertical className="h-4 w-4" />
      </button>
      
      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-accent/40 text-foreground shrink-0">
        {lessonTypeIcons[lesson.type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs sm:text-sm truncate">{lesson.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {lessonTypeLabels[lesson.type]}
          {lesson.duration && ` • ${lesson.duration}m`}
        </p>
      </div>
      
      <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8"
          onClick={() => onEdit(lesson)}
        >
          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(lesson.id)}
        >
          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
