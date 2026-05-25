import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../services/admin.service";
import type { AdminEnrollmentAPI } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "../components/AdminLayout";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<AdminEnrollmentAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    adminService.getEnrollments()
      .then(setEnrollments)
      .catch(() => toast.error("Nu s-au putut încărca înrolările."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter((e) => {
    const q = search.toLowerCase();
    return e.studentId?.toLowerCase().includes(q) || e.courseId?.toLowerCase().includes(q);
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteEnrollment(deleteId);
      setEnrollments((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success("Înrolare ștearsă.");
    } catch {
      toast.error("Eroare la ștergere.");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout title="Gestionare Înrolări">
      <div className="space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după ID student sau curs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Se încarcă înrolările...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Student ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Curs ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Progres</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Data înrolării</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground">
                        Nicio înrolare găsită.
                      </td>
                    </tr>
                  ) : filtered.map((e) => (
                    <tr key={e.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {e.studentId?.slice(0, 12)}…
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {e.courseId?.slice(0, 12)}…
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant={e.status === "completed" ? "default" : "outline"} className="text-xs">
                          {e.status === "completed" ? "Finalizat" : "Activ"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${e.overallProgress ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{e.overallProgress ?? 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {formatDate(e.enrolledAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Șterge înrolarea"
                            onClick={() => setDeleteId(e.id)}
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
              {filtered.length} din {enrollments.length} înrolări
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmi ștergerea înrolării?</AlertDialogTitle>
            <AlertDialogDescription>
              Studentul va pierde accesul la curs. Această acțiune nu poate fi anulată.
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
