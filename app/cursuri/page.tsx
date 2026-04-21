"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, GraduationCap, BookOpen, Clock, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import * as api from "@/lib/api";
import { toast } from "sonner";
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

const TEACHER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const FALLBACK_THUMBNAIL = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop";

type CourseListItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  modules: number;
  lessons: number;
  duration: string;
  students: number;
  status: "draft" | "published";
  tags: string[];
};

export default function CursuriPage() {
  const newCourseHref = `/?new=1&newToken=${Date.now().toString()}`;
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true);
      try {
        const teacherCourses = await api.getCoursesByTeacher(TEACHER_ID);
        const mappedCourses = await Promise.all(
          teacherCourses.map(async (course) => {
            const modules = await api.getModules(course.id);
            const lessonsCount = modules.reduce((acc, m) => acc + m.lectures.length, 0);
            const durationMinutes = modules.reduce(
              (acc, m) =>
                acc +
                m.lectures.reduce((lectureAcc, l) => lectureAcc + Math.round((l.durationSecs || 0) / 60), 0),
              0
            );
            const duration =
              durationMinutes < 60
                ? `${durationMinutes}min`
                : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`;

            return {
              id: course.id,
              title: course.title,
              description: course.description,
              thumbnail: course.thumbnailUrl || FALLBACK_THUMBNAIL,
              modules: modules.length,
              lessons: lessonsCount,
              duration,
              students: 0,
              status: (course.status === "published" ? "published" : "draft") as "published" | "draft",
              tags: course.tags || [],
            } satisfies CourseListItem;
          })
        );
        setCourses(mappedCourses);
      } catch (err) {
        toast.error("Eroare la încărcarea cursurilor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;
    try {
      await api.deleteCourse(deletingCourseId);
      setCourses((prev) => prev.filter((course) => course.id !== deletingCourseId));
      toast.success("Cursul a fost șters.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la ștergerea cursului.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-2xl">Cursurile Mele</h1>
                <p className="text-sm text-muted-foreground">
                  Gestionează și creează cursuri educaționale
                </p>
              </div>
            </div>
            <Button asChild className="gap-2">
              <Link href={newCourseHref}>
                <Plus className="h-4 w-4" />
                Curs Nou
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Course Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <p className="text-sm text-muted-foreground mb-4">Se încarcă lista cursurilor...</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge
                  className={`absolute top-3 right-3 ${
                    course.status === "published"
                      ? "bg-green-500 hover:bg-green-500"
                      : "bg-amber-500 hover:bg-amber-500"
                  }`}
                >
                  {course.status === "published" ? "Publicat" : "Ciornă"}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex gap-2 mb-2">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-accent/40 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-serif font-semibold text-lg mb-1 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.lessons} lecții
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.duration}
                  </span>
                  {course.status === "published" && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.students} studenți
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="w-full flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/?courseId=${course.id}`}>Editează Cursul</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeletingCourseId(course.id)}
                    aria-label="Șterge cursul"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* Add New Course Card */}
          <Link
            href={newCourseHref}
            className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center min-h-[320px] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Plus className="h-8 w-8" />
            </div>
            <span className="font-medium">Creează Curs Nou</span>
          </Link>
        </div>
      </main>

      <AlertDialog open={deletingCourseId !== null} onOpenChange={() => setDeletingCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge cursul</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi acest curs? Acțiunea nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-white">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
