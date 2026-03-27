"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, GraduationCap, BookOpen, Clock, Users } from "lucide-react";
import Link from "next/link";

const courses = [
  {
    id: "1",
    title: "Introducere în Web Development",
    description: "Învață bazele dezvoltării web moderne cu HTML, CSS și JavaScript.",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop",
    modules: 5,
    lessons: 24,
    duration: "12h 30min",
    students: 1250,
    status: "published" as const,
    tags: ["Web", "HTML", "CSS"],
  },
  {
    id: "2",
    title: "JavaScript Avansat",
    description: "Aprofundează cunoștințele de JavaScript cu concepte avansate.",
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=640&h=360&fit=crop",
    modules: 8,
    lessons: 42,
    duration: "18h 45min",
    students: 890,
    status: "published" as const,
    tags: ["JavaScript", "ES6+", "Async"],
  },
  {
    id: "3",
    title: "React pentru Începători",
    description: "Construiește aplicații moderne cu React.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop",
    modules: 3,
    lessons: 12,
    duration: "6h 20min",
    students: 0,
    status: "draft" as const,
    tags: ["React", "Frontend"],
  },
];

export default function CursuriPage() {
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
              <Link href="/">
                <Plus className="h-4 w-4" />
                Curs Nou
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Course Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Editează Cursul</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Add New Course Card */}
          <Link
            href="/"
            className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center min-h-[320px] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Plus className="h-8 w-8" />
            </div>
            <span className="font-medium">Creează Curs Nou</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
