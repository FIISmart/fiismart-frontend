import { useEffect, useState } from "react";
import { Search, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../services/admin.service";
import type { AdminCourseAPI } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "../components/AdminLayout";

const FALLBACK = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=70&fit=crop";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourseAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editCourse, setEditCourse] = useState<AdminCourseAPI | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", status: "draft" });
  const [editLoading, setEditLoading] = useState(false);

  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    adminService.getCourses()
      .then(setCourses)
      .catch(() => toast.error("Nu s-au putut încărca cursurile."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.teacherId?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  });

  const openEdit = (c: AdminCourseAPI) => {
    setEditCourse(c);
    setEditForm({ title: c.title, description: c.description ?? "", status: c.status ?? "draft" });
  };

  const handleSaveEdit = async () => {
    if (!editCourse) return;
    setEditLoading(true);
    try {
      const updated = await adminService.updateCourse(editCourse.id, {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
      });
      setCourses((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      toast.success("Curs actualizat.");
      setEditCourse(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la actualizare.");
    } finally {
      setEditLoading(false);
    }
  };

  const toggleHidden = async (c: AdminCourseAPI) => {
    try {
      const updated = await adminService.updateCourse(c.id, { hidden: !c.hidden });
      setCourses((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      toast.success(updated.hidden ? "Curs ascuns." : "Curs vizibil.");
    } catch {
      toast.error("Eroare la modificarea vizibilității.");
    }
  };

  const handleDelete = async () => {
    if (!deleteCourseId) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteCourse(deleteCourseId);
      setCourses((prev) => prev.filter((c) => c.id !== deleteCourseId));
      toast.success("Curs șters (inclusiv înrolările aferente).");
    } catch {
      toast.error("Eroare la ștergere.");
    } finally {
      setDeleteLoading(false);
      setDeleteCourseId(null);
    }
  };

  return (
    <AdminLayout title="Gestionare Cursuri">
      <div className="space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după titlu, profesor sau status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Se încarcă cursurile...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Curs</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Profesor ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Înrolări</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground">
                        Niciun curs găsit.
                      </td>
                    </tr>
                  ) : filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnailUrl ?? FALLBACK}
                            alt={c.title}
                            className="w-16 h-10 rounded-lg object-cover hidden sm:block shrink-0"
                          />
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{c.title}</p>
                            <p className="text-xs text-muted-foreground">{c.moduleCount} module</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground font-mono">{c.teacherId?.slice(0, 10)}…</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={c.status === "published" ? "default" : "outline"}
                            className="text-xs w-fit"
                          >
                            {c.status === "published" ? "Publicat" : "Draft"}
                          </Badge>
                          {c.hidden && (
                            <Badge variant="secondary" className="text-xs w-fit">Ascuns</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {c.enrollmentCount}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Editează" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-muted-foreground"
                            title={c.hidden ? "Arată" : "Ascunde"}
                            onClick={() => toggleHidden(c)}
                          >
                            {c.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Șterge"
                            onClick={() => setDeleteCourseId(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-muted/20 border-t border-border text-xs text-muted-foreground">
              {filtered.length} din {courses.length} cursuri
            </div>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editează cursul</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium block mb-1.5">Titlu</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Descriere</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="draft">Draft</option>
                <option value="published">Publicat</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCourse(null)}>Anulează</Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteCourseId} onOpenChange={(open) => !open && setDeleteCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmi ștergerea cursului?</AlertDialogTitle>
            <AlertDialogDescription>
              Cursul și toate înrolările aferente vor fi șterse permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLoading ? "Se șterge..." : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
