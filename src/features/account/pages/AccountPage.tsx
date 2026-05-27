import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { getMyProfile, resolveFileUrl, updateMyProfile, uploadAvatar, type AccountProfileAPI } from "@/lib/api";

type AccountForm = {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  faculty: string;
  specialization: string;
  studyYear: string;
  educationLevel: string;
  department: string;
  academicTitle: string;
  interestsText: string;
  subjectsText: string;
  tutorProfileEnabled: boolean;
};

const emptyForm: AccountForm = {
  firstName: "",
  lastName: "",
  displayName: "",
  phone: "",
  bio: "",
  avatarUrl: "",
  faculty: "",
  specialization: "",
  studyYear: "",
  educationLevel: "",
  department: "",
  academicTitle: "",
  interestsText: "",
  subjectsText: "",
  tutorProfileEnabled: false,
};

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<AccountProfileAPI | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setForm(toForm(data));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Nu am putut incarca profilul.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const initials = useMemo(() => {
    const name = form.displayName || `${form.firstName} ${form.lastName}`.trim() || user?.email || "U";
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }, [form.displayName, form.firstName, form.lastName, user?.email]);

  const visibleAvatar = avatarPreview || resolveFileUrl(form.avatarUrl);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      let avatarUrl = form.avatarUrl;
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile);
        avatarUrl = uploaded.url;
      }

      const updated = await updateMyProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        displayName: form.displayName,
        phone: form.phone,
        bio: form.bio,
        avatarUrl,
        faculty: form.faculty,
        specialization: form.specialization,
        studyYear: form.studyYear.trim() ? Number(form.studyYear) : null,
        educationLevel: form.educationLevel,
        department: form.department,
        academicTitle: form.academicTitle,
        interests: splitList(form.interestsText),
        subjects: splitList(form.subjectsText),
        tutorProfileEnabled: form.tutorProfileEnabled,
      });
      setProfile(updated);
      setForm(toForm(updated));
      setAvatarFile(null);
      setAvatarPreview("");
      await refreshUser();
      toast.success("Profilul a fost actualizat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut salva profilul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelected = (file?: File) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Alege o imagine JPG, PNG sau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatarul trebuie sa aiba cel mult 5 MB.");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const content = (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Cont</p>
        <h1 className="font-serif text-3xl font-bold text-foreground">Contul meu</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Actualizeaza informatiile publice ale contului. Emailul si rolul sunt controlate de autentificare si nu pot fi schimbate aici.
        </p>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Se incarca profilul...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-8 text-center text-red-600">{error}</CardContent></Card>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="bg-white">
            <CardContent className="flex flex-col items-center p-6 text-center">
              {visibleAvatar ? (
                <img src={visibleAvatar} alt="" className="h-24 w-24 rounded-full object-cover" />
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
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => handleAvatarSelected(event.target.files?.[0])}
              />
              <Button type="button" variant="outline" className="mt-5 gap-2" onClick={() => avatarInputRef.current?.click()}>
                <Camera className="h-4 w-4" />
                Schimba avatar
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">JPG, PNG sau WebP, maxim 5 MB.</p>
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

              <Field label="Nume afisat">
                <Input value={form.displayName} onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))} maxLength={160} />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email">
                  <Input value={profile?.email ?? ""} readOnly className="bg-muted/40" />
                </Field>
                <Field label="Telefon">
                  <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} maxLength={40} placeholder="Optional" />
                </Field>
              </div>

              <Field label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={5}
                  maxLength={1000}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Scrie cateva detalii despre tine..."
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Facultate / scoala">
                  <Input value={form.faculty} onChange={(e) => setForm((prev) => ({ ...prev, faculty: e.target.value }))} maxLength={120} placeholder="ex: Facultatea de Informatica" />
                </Field>
                <Field label="Specializare">
                  <Input value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} maxLength={120} placeholder="ex: Informatica" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Nivel">
                  <Input value={form.educationLevel} onChange={(e) => setForm((prev) => ({ ...prev, educationLevel: e.target.value }))} maxLength={40} placeholder="student / elev / absolvent" />
                </Field>
                <Field label="An de studiu">
                  <Input value={form.studyYear} onChange={(e) => setForm((prev) => ({ ...prev, studyYear: e.target.value.replace(/\D/g, "").slice(0, 2) }))} inputMode="numeric" placeholder="ex: 2" />
                </Field>
                <Field label="Departament">
                  <Input value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} maxLength={120} placeholder="pentru profesori" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Titlu / functie">
                  <Input value={form.academicTitle} onChange={(e) => setForm((prev) => ({ ...prev, academicTitle: e.target.value }))} maxLength={120} placeholder="ex: Asistent universitar" />
                </Field>
                <Field label="Interese">
                  <Input value={form.interestsText} onChange={(e) => setForm((prev) => ({ ...prev, interestsText: e.target.value }))} placeholder="React, Java, SQL" />
                </Field>
              </div>

              <Field label="Domenii de expertiza">
                <Input value={form.subjectsText} onChange={(e) => setForm((prev) => ({ ...prev, subjectsText: e.target.value }))} placeholder="separate prin virgula" />
              </Field>

              {profile?.role === "PROFESSOR" && (
                <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.tutorProfileEnabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, tutorProfileEnabled: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  Disponibil pentru mentorat
                </label>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Se salveaza..." : "Salveaza"}
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

function toForm(data: AccountProfileAPI): AccountForm {
  return {
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    displayName: data.displayName ?? "",
    phone: data.phone ?? "",
    bio: data.bio ?? "",
    avatarUrl: data.avatarUrl ?? "",
    faculty: data.faculty ?? "",
    specialization: data.specialization ?? "",
    studyYear: data.studyYear != null ? String(data.studyYear) : "",
    educationLevel: data.educationLevel ?? "",
    department: data.department ?? "",
    academicTitle: data.academicTitle ?? "",
    interestsText: (data.interests ?? []).join(", "),
    subjectsText: (data.subjects ?? []).join(", "),
    tutorProfileEnabled: Boolean(data.tutorProfileEnabled),
  };
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
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
