import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProfessorTutorRequests, updateTutorRequestStatus, type TutorRequestAPI } from "@/lib/api";

const statusLabel: Record<TutorRequestAPI["status"], string> = {
  pending: "In asteptare",
  accepted: "Acceptata",
  declined: "Refuzata",
  resolved: "Rezolvata",
};

export default function ProfessorMentorRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<TutorRequestAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfessorTutorRequests()
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Nu am putut incarca cererile.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeStatus = async (requestId: string, status: TutorRequestAPI["status"]) => {
    setUpdatingId(requestId);
    try {
      const updated = await updateTutorRequestStatus(requestId, status);
      setRequests((prev) => prev.map((request) => (request.id === requestId ? updated : request)));
      toast.success("Statusul cererii a fost actualizat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut actualiza cererea.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-edu-bg text-edu-foreground">
      <ProfDashboardNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-edu-primary">Mentorat</p>
          <h1 className="font-poppins text-3xl font-bold">Cereri de mentorat</h1>
          <p className="mt-2 max-w-2xl text-edu-muted-fg">
            Vezi studentii care au cerut sprijin si actualizeaza statusul fiecarei cereri.
          </p>
        </div>

        {isLoading && <p className="text-edu-muted-fg">Se incarca cererile...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!isLoading && !error && requests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-edu-muted-fg">
              Nu ai cereri de mentorat momentan.
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
                      <h2 className="font-semibold text-lg">{request.studentName || "Student"}</h2>
                      <span className="rounded-full bg-edu-primary/10 px-3 py-1 text-xs font-semibold text-edu-primary">
                        {statusLabel[request.status] ?? request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-edu-muted-fg whitespace-pre-wrap">
                      {request.message || "Studentul nu a adaugat un mesaj."}
                    </p>
                    <p className="mt-3 text-xs text-edu-muted-fg">
                      Trimisa la {request.createdAt ? new Date(request.createdAt).toLocaleString("ro-RO") : "data indisponibila"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updatingId === request.id || request.status === "accepted"}
                      onClick={() => changeStatus(request.id, "accepted")}
                    >
                      Accepta
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updatingId === request.id || request.status === "declined"}
                      onClick={() => changeStatus(request.id, "declined")}
                    >
                      Refuza
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updatingId === request.id || request.status === "resolved"}
                      onClick={() => changeStatus(request.id, "resolved")}
                    >
                      Marcheaza rezolvata
                    </Button>
                    {(request.status === "accepted" || request.status === "resolved") && (
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate(`/professor/mentor-requests/${request.id}/chat`)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Conversatie
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
