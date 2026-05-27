import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { getMyProfile, updateMyProfile, type AccountProfileAPI } from "@/lib/api";

type AccountForm = {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
};

const emptyForm: AccountForm = {
  firstName: "",
  lastName: "",
  displayName: "",
  phone: "",
  bio: "",
  avatarUrl: "",
};

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<AccountProfileAPI | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          displayName: data.displayName ?? "",
          phone: data.phone ?? "",
          bio: data.bio ?? "",
          avatarUrl: data.avatarUrl ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Nu am putut încărca profilul.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => {
    const name = form.displayName || `${form.firstName} ${form.lastName}`.trim() || user?.email || "U";
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }, [form.displayName, form.firstName, form.lastName, user?.email]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      setForm({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        displayName: updated.displayName ?? "",
        phone: updated.phone ?? "",
        bio: updated.bio ?? "",
        avatarUrl: updated.avatarUrl ?? "",
      });
      await refreshUser();
      toast.success("Profilul a fost actualizat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut salva profilul.");
    } finally {
      setIsSaving(false);
    }
  };

  const content = (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Cont</p>
        <h1 className="font-serif text-3xl font-bold text-foreground">Contul meu</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Actualizează informațiile publice ale contului. Emailul și rolul sunt controlate de autentificare și nu pot fi schimbate aici.
        </p>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă profilul...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-8 text-center text-red-600">{error}</CardContent></Card>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="bg-white">
            <CardContent className="flex flex-col items-center p-6 text-center">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {initials}
                </div>
              )}
              <h2 className="mt-4 text-lg font-bold">{form.displayName || `${form.firstName} ${form.lastName}`.trim() || "Utilizator"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <span className="mt-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {roleLabel(profile?.role)}
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Prenume">
                  <Input value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} maxLength={80} />
                </Field>
                <Field label="Nume">
                  <Input value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} maxLength={80} />
                </Field>
              </div>

              <Field label="Nume afișat">
                <Input value={form.displayName} onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))} maxLength={160} />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email">
                  <Input value={profile?.email ?? ""} readOnly className="bg-muted/40" />
                </Field>
                <Field label="Telefon">
                  <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} maxLength={40} placeholder="Opțional" />
                </Field>
              </div>

              <Field label="Avatar URL">
                <div className="flex gap-2">
                  <Input value={form.avatarUrl} onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))} maxLength={500} placeholder="https://..." />
                  <Button type="button" variant="outline" className="shrink-0" disabled title="Upload avatar nu este încă legat">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </Field>

              <Field label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={5}
                  maxLength={1000}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Scrie câteva detalii despre tine..."
                />
              </Field>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Se salvează..." : "Salvează"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </main>
  );

  if (user?.role === "ADMIN") {
    return <AdminLayout title="Contul meu">{content}</AdminLayout>;
  }

  if (user?.role === "PROFESSOR") {
    return (
      <div className="min-h-screen bg-edu-bg">
        <ProfDashboardNavbar />
        {content}
      </div>
    );
  }

  const studentName = user?.displayName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Student";
  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <StudentNavbar studentName={studentName} initials={initials} />
      {content}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function roleLabel(role?: string | null) {
  if (role === "PROFESSOR") return "Profesor";
  if (role === "ADMIN") return "Administrator";
  return "Student";
}
