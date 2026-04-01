"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Send,
  Pencil,
  ImagePlus,
  X,
  Tag,
  Clock,
  BookOpen,
} from "lucide-react";
import type { Course } from "@/lib/course-types";
import Link from "next/link";

interface CourseHeaderProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving?: boolean;
}

export function CourseHeader({
  course,
  onUpdate,
  onSaveDraft,
  onPublish,
  isSaving,
}: CourseHeaderProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const [editDescription, setEditDescription] = useState(course.description);
  const [editTags, setEditTags] = useState(course.tags.join(", "));

  const handleSaveDetails = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
      tags: editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setEditDialogOpen(false);
  };

  const totalLessons = course.lessons.length;
  const totalDuration = course.lessons.reduce(
    (acc, l) => acc + (l.duration || 0),
    0
  );
  const hasQuiz = !!course.quiz;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}min` : ""}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Mobile: Stacked Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:h-16 py-3 sm:py-0 gap-3 sm:gap-4">
            {/* Top Row on Mobile: Back + Title + Status */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/cursuri">
                <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              
              <button
                onClick={() => setEditDialogOpen(true)}
                className="flex-1 min-w-0 text-left group"
              >
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-base sm:text-xl truncate group-hover:text-primary transition-colors">
                    {course.title || "Curs Nou"}
                  </h1>
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 opacity-50 sm:opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {course.description || "Adaugă o descriere..."}
                </p>
              </button>
              
              <Badge
                variant={course.status === "published" ? "default" : "secondary"}
                className={`shrink-0 text-xs ${
                  course.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {course.status === "published" ? "Publicat" : "Ciornă"}
              </Badge>
            </div>

            {/* Bottom Row on Mobile: Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-sm"
              >
                <Save className="h-4 w-4" />
                <span className="sm:inline">Salvează</span>
              </Button>
              <Button onClick={onPublish} disabled={isSaving} className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-sm">
                <Send className="h-4 w-4" />
                <span className="sm:inline">Publică</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Course Stats Bar */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>
                <strong className="text-foreground">{totalLessons}</strong>{" "}
                <span className="hidden xs:inline">lecții</span>
                <span className="xs:hidden">lec</span>
              </span>
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <strong className="text-foreground">
                  {formatDuration(totalDuration)}
                </strong>
              </div>
            )}
            {hasQuiz && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <strong className="text-foreground">1</strong>{" "}
                quiz
              </div>
            )}
            {course.tags.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 ml-auto">
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-accent/40 text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="secondary" className="bg-accent/40 text-xs">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Course Details Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="font-serif text-lg sm:text-xl">
              Editează Detaliile Cursului
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label className="text-sm">Imagine de Prezentare</Label>
              <div className="relative aspect-video bg-muted rounded-xl border-2 border-dashed border-border overflow-hidden group">
                {course.thumbnail ? (
                  <>
                    <img
                      src={course.thumbnail}
                      alt="Course thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm" className="gap-2">
                        <ImagePlus className="h-4 w-4" />
                        Schimbă
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdate({ thumbnail: undefined })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <button className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <ImagePlus className="h-10 w-10 mb-2" />
                    <span className="text-sm">Adaugă imagine</span>
                    <span className="text-xs">Recomandare: 1280x720px</span>
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="course-title">Titlu Curs</Label>
              <Input
                id="course-title"
                placeholder="ex: Introducere în Web Development"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-muted font-serif text-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="course-description">Descriere</Label>
              <Textarea
                id="course-description"
                placeholder="Descrie pe scurt despre ce este acest curs..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-muted min-h-[100px]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tag-uri (separate prin virgulă)
              </Label>
              <Input
                placeholder="ex: Web, HTML, CSS, JavaScript"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="bg-muted"
              />
              {editTags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-accent/40">
                        {tag}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveDetails}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
