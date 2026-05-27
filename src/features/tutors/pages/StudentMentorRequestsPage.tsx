import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getStudentTutorRequests, type TutorRequestAPI } from "@/lib/api";

const statusLabel: Record<TutorRequestAPI["status"], string> = {
  pending: "În așteptare",
  accepted: "Acceptată",
  declined: "Refuzată",
  resolved: "Rezolvată",
};

const statusHint: Record<TutorRequestAPI["status"], string> = {
  pending: "În așteptarea răspunsului mentorului.",
  accepted: "Mentorul a acceptat cererea. Poți deschide conversația.",
  declined: "Cererea a fost refuzată.",
  resolved: "Mentoratul a fost marcat ca rezolvat.",
};

export default function StudentMentorRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<TutorRequestAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStudentTutorRequests()
      .then((data) => {
        if (!cancelled) setRequests(data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Nu am putut încărca cererile.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.firstName || "Student";
  const initials = `${user?.firstName?.[0] ?? "S"}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4EFE8] pb-16">
      <StudentNavbar studentName={firstName} initials={initials} />
      <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 pt-8 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9b8ec7]">Mentorat</p>
            <h1 className="font-serif text-3xl font-bold text-[#1a1a2e]">Cererile mele</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Urmărește răspunsurile mentorilor și continuă conversațiile acceptate.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => navigate("/student/tutors")}>
            Găsește un tutore
          </Button>
        </div>

        {isLoading && <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă cererile...</CardContent></Card>}
        {error && <Card><CardContent className="p-8 text-center text-red-600">{error}</CardContent></Card>}
        {!isLoading && !error && requests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nu ai trimis încă nicio cerere de mentorat.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="bg-white">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#1a1a2e]">{request.tutorName || "Mentor"}</h2>
                      <span className="rounded-full bg-[#9b8ec7]/10 px-3 py-1 text-xs font-semibold text-[#7d6bb0]">
                        {statusLabel[request.status] ?? request.status}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {request.message || "Nu ai adăugat un mesaj."}
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      Trimisă la {request.createdAt ? new Date(request.createdAt).toLocaleString("ro-RO") : "data indisponibilă"}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">{statusHint[request.status]}</p>
                  </div>
                  {(request.status === "accepted" || request.status === "resolved") && (
                    <Button
                      type="button"
                      className="gap-2"
                      onClick={() => navigate(`/student/mentor-requests/${request.id}/chat`)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Deschide conversația
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
