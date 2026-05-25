import { useEffect, useState } from "react";
import { Search, Trash2, Pencil, ShieldCheck, UserX, UserCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../services/admin.service";
import type { AdminUserAPI } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";
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

const ROLE_BADGE: Record<string, string> = {
  admin:     "bg-[#5A5470] text-white",
  professor: "bg-primary/20 text-primary",
  student:   "bg-accent/40 text-accent-foreground",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin", professor: "Profesor", student: "Student",
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editUser, setEditUser] = useState<AdminUserAPI | null>(null);
  const [editForm, setEditForm] = useState({ displayName: "", isAdmin: false });
  const [editLoading, setEditLoading] = useState(false);

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    adminService.getUsers()
      .then(setUsers)
      .catch(() => toast.error("Nu s-au putut încărca utilizatorii."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const openEdit = (u: AdminUserAPI) => {
    setEditUser(u);
    setEditForm({ displayName: u.displayName ?? "", isAdmin: u.isAdmin ?? u.role === "admin" });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    const isSelf = editUser.id === currentUser?.id;
    const originalIsAdmin = editUser.isAdmin ?? editUser.role === "admin";
    if (isSelf && editForm.isAdmin !== originalIsAdmin) {
      toast.error("Nu îți poți modifica propriul rol de administrator!", {
        description: "Acțiunea este interzisă pentru a preveni pierderea accesului la panou.",
        duration: 5000,
      });
      return;
    }
    setEditLoading(true);
    try {
      const updated = await adminService.updateUser(editUser.id, {
        displayName: editForm.displayName,
        isAdmin: editForm.isAdmin,
      });
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      toast.success("Utilizator actualizat.");
      setEditUser(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la actualizare.");
    } finally {
      setEditLoading(false);
    }
  };

  const toggleBan = async (u: AdminUserAPI) => {
    if (u.id === currentUser?.id) {
      toast.error("Nu îți poți suspenda propriul cont de administrator!", {
        description: "Acțiunea este interzisă pentru a preveni blocarea accesului tău la panou.",
        duration: 5000,
      });
      return;
    }
    try {
      const updated = await adminService.updateUser(u.id, { banned: !u.banned });
      setUsers((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      toast.success(updated.banned ? "Utilizator banat." : "Ban ridicat.");
    } catch {
      toast.error("Eroare la modificarea ban-ului.");
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    if (deleteUserId === currentUser?.id) {
      toast.error("Nu te poți șterge pe tine însuți.");
      setDeleteUserId(null);
      return;
    }
    setDeleteLoading(true);
    try {
      await adminService.deleteUser(deleteUserId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
      toast.success("Utilizator șters.");
    } catch {
      toast.error("Eroare la ștergere.");
    } finally {
      setDeleteLoading(false);
      setDeleteUserId(null);
    }
  };

  return (
    <AdminLayout title="Gestionare Utilizatori">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după email, nume sau rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Se încarcă utilizatorii...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Utilizator</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rol</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Cursuri</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground">
                        Niciun utilizator găsit.
                      </td>
                    </tr>
                  ) : filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{u.displayName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role] ?? "bg-muted text-muted-foreground"}`}>
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {u.ownedCoursesCount} create · {u.enrolledCoursesCount} înrolat
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {u.banned ? (
                          <Badge variant="destructive" className="text-xs">Banat</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">Activ</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Editează" onClick={() => openEdit(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className={`h-8 w-8 ${u.banned ? "text-green-600 hover:text-green-700" : "text-amber-500 hover:text-amber-600"}`}
                            title={u.banned ? "Ridică ban" : "Banează"}
                            onClick={() => toggleBan(u)}
                          >
                            {u.banned ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Șterge"
                            onClick={() => setDeleteUserId(u.id)}
                            disabled={u.id === currentUser?.id}
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
              {filtered.length} din {users.length} utilizatori
            </div>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editează utilizatorul</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editUser?.id === currentUser?.id && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Editezi propriul cont. Modificarea rolului de administrator este interzisă.</span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <p className="text-sm text-muted-foreground mt-1">{editUser?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Nume afișat</label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Nume afișat"
              />
            </div>
            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${editUser?.id === currentUser?.id ? "border-input bg-muted/40 opacity-60" : "border-input bg-background"}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#5A5470]" />
                <span className="text-sm font-medium text-foreground">Rol Admin</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={editForm.isAdmin}
                disabled={editUser?.id === currentUser?.id}
                onClick={() => {
                  if (editUser?.id === currentUser?.id) {
                    toast.error("Nu îți poți modifica propriul rol de administrator!", {
                      description: "Acțiunea este interzisă pentru a preveni pierderea accesului la panou.",
                      duration: 5000,
                    });
                    return;
                  }
                  setEditForm((f) => ({ ...f, isAdmin: !f.isAdmin }));
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  editForm.isAdmin ? "bg-[#5A5470]" : "bg-muted"
                } ${editUser?.id === currentUser?.id ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    editForm.isAdmin ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {editForm.isAdmin && (
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Utilizatorul va primi acces complet la Admin Panel și va fi adăugat în grupul ADMIN din Cognito.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Anulează</Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmi ștergerea?</AlertDialogTitle>
            <AlertDialogDescription>
              Utilizatorul va fi șters permanent. Această acțiune nu poate fi anulată.
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
