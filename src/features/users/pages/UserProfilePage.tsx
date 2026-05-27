import { useEffect, useState } from "react";
import type React from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, GraduationCap, Mail, Star, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { getUserProfile, resolveFileUrl, type PublicUserProfileAPI } from "@/lib/api";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicUserProfileAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    getUserProfile(userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Nu am putut incarca profilul.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const content = (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      {loading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Se incarca profilul...</CardContent></Card>
      ) : error || !profile ? (
        <Card><CardContent className="p-8 text-center text-destructive">{error || "Profil indisponibil."}</CardContent></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="bg-white">
            <CardContent className="flex flex-col items-center p-6 text-center">
              {profile.avatarUrl ? (
                <img src={resolveFileUrl(profile.avatarUrl)} alt="" className="h-28 w-28 rounded-full object-cover" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-12 w-12" />
                </div>
              )}
              <h1 className="mt-4 text-2xl font-bold">{profile.displayName || "Utilizator"}</h1>
              <p className="text-sm font-semibold text-primary">{roleLabel(profile.role)}</p>
              {profile.headline && <p className="mt-2 text-sm text-muted-foreground">{profile.headline}</p>}
              {user?.role === "STUDENT" && profile.role === "PROFESSOR" && profile.tutorProfileEnabled && (
                <Button asChild className="mt-5 w-full">
                  <Link to="/student/tutors">Trimite cerere de mentorat</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-xl font-bold">Despre</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {profile.bio || "Acest utilizator nu a completat inca o descriere publica."}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info icon={<GraduationCap className="h-4 w-4" />} label="Facultate" value={profile.faculty} />
                  <Info icon={<GraduationCap className="h-4 w-4" />} label="Specializare" value={profile.specialization} />
                  <Info icon={<BookOpen className="h-4 w-4" />} label="Nivel" value={profile.educationLevel} />
                  <Info icon={<BookOpen className="h-4 w-4" />} label="An de studiu" value={profile.studyYear ? String(profile.studyYear) : null} />
                  <Info icon={<Mail className="h-4 w-4" />} label="Departament" value={profile.department} />
                  <Info icon={<Mail className="h-4 w-4" />} label="Titlu" value={profile.academicTitle} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-xl font-bold">Activitate</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="Cursuri publicate" value={profile.publishedCourseCount} />
                  <Stat label="Rating" value={profile.tutorRating ?? "N/A"} icon={<Star className="h-4 w-4 text-amber-500" />} />
                  <Stat label="Review-uri" value={profile.tutorReviewCount ?? 0} />
                </div>
                <TagList title="Interese" values={profile.interests} />
                <TagList title="Domenii" values={profile.subjects} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );

  if (user?.role === "ADMIN") return <AdminLayout title="Profil utilizator">{content}</AdminLayout>;
  if (user?.role === "PROFESSOR") return <div className="min-h-screen bg-edu-bg"><ProfDashboardNavbar />{content}</div>;
  const studentName = user?.displayName || user?.firstName || "Student";
  const initials = studentName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <div className="min-h-screen bg-[#F4EFE8]"><StudentNavbar studentName={studentName} initials={initials} />{content}</div>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value || "Necompletat"}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">{icon}<p className="text-lg font-bold">{value}</p></div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TagList({ title, values }: { title: string; values?: string[] | null }) {
  if (!values?.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{value}</span>
        ))}
      </div>
    </div>
  );
}

function roleLabel(role?: string | null) {
  if (role === "PROFESSOR") return "Profesor";
  if (role === "ADMIN") return "Administrator";
  return "Student";
}
