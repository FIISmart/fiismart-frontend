"use client";

import { useState, useRef } from "react";
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
import { Video, FileText, Code, Clock, GripVertical, Trash2, Pencil, Upload, Loader2 } from "lucide-react";
import type { Lesson, LessonType } from "@/lib/course-types";
import { generateId } from "@/lib/course-types";
import * as api from "@/lib/api"; // Added for upload helper
import { toast } from "sonner";

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
  pdf: "Document PDF",
  markdown: "Markdown/Text",
};

export function LessonEditor({ lesson, onSave, onCancel, isOpen }: LessonEditorProps) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [type, setType] = useState<LessonType>(lesson?.type || "video");
  const [content, setContent] = useState(lesson?.content || "");
  const [duration, setDuration] = useState(lesson?.duration?.toString() || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await api.uploadFile(file);
      setContent(result.url);
      toast.success("Fișier încărcat cu succes!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la încărcarea fișierului");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

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

  const isValid = title.trim() !== "" && content.trim() !== "" && !isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-[600px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg sm:text-xl">
            {lesson ? "Editează Lecția" : "Adaugă Lecție Nouă"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Titlu Lecție</Label>
            <Input
              placeholder="ex: Introducere în React"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Tip Conținut</Label>
            <Select value={type} onValueChange={(v) => {
              setType(v as LessonType);
              setContent(""); // Reset content on type change
            }}>
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
            <Label>
              {type === "video" ? "Sursă Video" : 
               type === "pdf" ? "Sursă PDF" : 
               "Conținut Markdown"}
            </Label>
            
            {type === "markdown" ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Scrie conținutul aici sau încarcă un fișier .md..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] bg-muted font-mono text-sm"
                />
                <div className="flex justify-end">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".md,.markdown,text/markdown,text/plain"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Încarcă fișier markdown
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder={type === "video" ? "URL YouTube/Vimeo sau încarcă..." : "URL PDF sau încarcă..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-muted flex-1"
                />
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={type === "video" ? "video/*" : ".pdf"}
                    onChange={handleFileUpload}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Durată (minute)
            </Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-muted w-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Anulează</Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {lesson ? "Salvează Modificările" : "Adaugă Lecția"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ... LessonItem remains the same
export function LessonItem({ lesson, onEdit, onDelete }: { lesson: Lesson, onEdit: (l: Lesson) => void, onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border group hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/40 text-foreground">
        {lessonTypeIcons[lesson.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">
          {lessonTypeLabels[lesson.type]} {lesson.duration && `• ${lesson.duration}m`}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(lesson)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(lesson.id)}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}