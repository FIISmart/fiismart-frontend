import { useState, useEffect } from "react";
import { Plus, Pencil, Trash, Calendar as CalendarIcon, Clock, BookOpen, Download } from "lucide-react";
import "../../landing/landing.css";
import { useAuth } from "@/features/auth/context/AuthContext";
import { UserRole } from "@/features/auth/types";
import { getCourses } from "@/features/dashboard-student/services/dashboard-student.service";
import { getCoursesByTeacher } from "@/lib/api";
import { StudentCourse } from "@/features/dashboard-student/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/features/landing/components/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseTitle: string;
}

const DAYS = [
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
  "Duminică",
];

export default function TimetablePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  // Form state
  const [selectedDay, setSelectedDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem(`timetable_${user?.id}`);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    // Load courses based on role
    if (user?.id) {
      if (user.role === UserRole.PROFESSOR) {
        getCoursesByTeacher(user.id)
          .then((teacherCourses) => {
            // Map CourseAPI to a shape compatible with our Select
            const mapped = teacherCourses.map(c => ({
              title: c.title,
              overallProgress: 0,
              enrollmentCount: c.enrollmentCount ?? 0,
              avgRating: c.avgRating ?? 0
            }));
            setCourses(mapped);
          })
          .catch((err) => {
            console.error("Failed to load professor courses:", err);
            toast.error("Nu am putut încărca cursurile.");
          });
      } else {
        getCourses(user.id)
          .then(setCourses)
          .catch((err) => {
            console.error("Failed to load student courses:", err);
            toast.error("Nu am putut încărca cursurile.");
          });
      }
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`timetable_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user?.id]);

  const handleOpenAddDialog = () => {
    setEditingEntry(null);
    setSelectedDay("");
    setStartTime("");
    setEndTime("");
    setSelectedCourse("");
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setSelectedDay(entry.day);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setSelectedCourse(entry.courseTitle);
    setIsDialogOpen(true);
  };

  const handleSaveEntry = () => {
    if (!selectedDay || !startTime || !endTime || !selectedCourse) {
      toast.error("Vă rugăm să completați toate câmpurile.");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Ora de început trebuie să fie înainte de ora de sfârșit.");
      return;
    }

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingEntry.id
            ? {
                ...e,
                day: selectedDay,
                startTime,
                endTime,
                courseTitle: selectedCourse,
              }
            : e
        )
      );
      toast.success("Programare actualizată cu succes!");
    } else {
      const newEntry: TimetableEntry = {
        id: crypto.randomUUID(),
        day: selectedDay,
        startTime,
        endTime,
        courseTitle: selectedCourse,
      };
      setEntries((prev) => [...prev, newEntry]);
      toast.success("Programare adăugată cu succes!");
    }

    setIsDialogOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Programare ștearsă.");
  };

  const entriesByDay = (day: string) => {
    return entries
      .filter((e) => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleExportPDF = () => {
    if (entries.length === 0) {
      toast.error("Nu aveți nicio activitate în orar pentru a exporta.");
      return;
    }

    const doc = new jsPDF();
    const tableData: string[][] = [];

    DAYS.forEach((day) => {
      const dayEntries = entriesByDay(day);
      if (dayEntries.length > 0) {
        dayEntries.forEach((entry, index) => {
          tableData.push([
            index === 0 ? day : "",
            `${entry.startTime} - ${entry.endTime}`,
            entry.courseTitle,
          ]);
        });
      }
    });

    doc.setFontSize(20);
    doc.text("Orarul Meu FiiSmart", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generat la: ${new Date().toLocaleString("ro-RO")}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Ziua", "Interval Orar", "Curs"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [155, 142, 199] },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: "auto" },
      },
    });

    doc.save(`Orar_FiiSmart_${user?.firstName || "Student"}.pdf`);
    toast.success("Orarul a fost descărcat cu succes!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar solid={true} />
      
      <div className="mt-16 lg:mt-18 pt-12 pb-20 border-t border-border/10">
        <main className="fii-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
              <CalendarIcon className="text-primary" />
              Orarul Meu
            </h1>
            <p className="text-muted-foreground">
              Gestionează programul tău săptămânal și cursurile la care participi.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExportPDF} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Descarcă PDF
            </Button>
            <Button onClick={handleOpenAddDialog} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Adaugă Programare
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-12 max-w-4xl mx-auto">
          {DAYS.map((day) => (
            <section key={day} className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-primary/20 pb-2">
                <h2 className="font-heading font-bold text-2xl text-foreground flex items-center gap-3">
                  {day}
                  <span className="text-sm bg-primary/10 text-primary px-3 py-0.5 rounded-full font-semibold">
                    {entriesByDay(day).length} activități
                  </span>
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2 text-xs"
                  onClick={() => {
                    handleOpenAddDialog();
                    setSelectedDay(day);
                  }}
                >
                  <Plus size={14} />
                  Adaugă
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entriesByDay(day).length > 0 ? (
                  entriesByDay(day).map((entry) => (
                    <Card key={entry.id} className="group hover:border-primary/50 transition-all shadow-sm hover:shadow-md overflow-hidden bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary font-bold">
                              <Clock size={16} />
                              <span className="text-sm">{entry.startTime} - {entry.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleOpenEditDialog(entry)}
                                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
                                title="Editează"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-border"
                                title="Șterge"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="font-semibold text-base flex items-start gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary mt-0.5">
                              <BookOpen size={18} />
                            </div>
                            <span className="leading-tight pt-1">{entry.courseTitle}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 px-4 border-2 border-dashed border-border rounded-xl bg-muted/20">
                    <p className="text-sm text-muted-foreground italic mb-3">Nu ai nicio activitate programată pentru această zi.</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-primary hover:bg-primary/5"
                      onClick={() => {
                        handleOpenAddDialog();
                        setSelectedDay(day);
                      }}
                    >
                      <Plus size={16} />
                      Planifică ceva
                    </Button>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Modifică Programarea" : "Adaugă Programare Nouă"}</DialogTitle>
            <DialogDescription>
              Introduceți detaliile activității din orar. Toate câmpurile sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="day">Ziua Săptămânii</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Selectează ziua" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Ora Început</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Ora Sfârșit</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">Cursul</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Selectează cursul" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem key={course.title} value={course.title}>
                        {course.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground italic text-center">
                      Nu s-au găsit cursuri înscrise
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Dacă nu vezi cursurile tale, asigură-te că ești înscris la cel puțin un curs.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveEntry}>
              {editingEntry ? "Salvează Modificările" : "Adaugă în Orar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
