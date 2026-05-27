import { useEffect, useMemo, useState } from "react";
import { Search, Star, UserRound, BookOpen, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { createTutorRequest, getTutors, type TutorAPI } from "@/lib/api";

export default function TutorsPage() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<TutorAPI[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorAPI | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTutors()
      .then((data) => {
        if (!cancelled) setTutors(data ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Nu am putut incarca tutorii.";
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTutors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tutors;
    return tutors.filter((tutor) => {
      const haystack = [
        tutor.displayName,
        tutor.headline ?? "",
        tutor.bio,
        ...(tutor.tags ?? []),
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, tutors]);

  const firstName = user?.firstName || "Student";
  const initials = `${user?.firstName?.[0] ?? "S"}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const handleSubmitRequest = async () => {
    if (!selectedTutor || submittingRequest) return;
    setSubmittingRequest(true);
    try {
      await createTutorRequest({
        tutorId: selectedTutor.id,
        message: requestMessage,
      });
      toast.success("Cererea a fost trimisa catre tutor.");
      setSelectedTutor(null);
      setRequestMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut trimite cererea.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE8] pb-16">
      <StudentNavbar studentName={firstName} initials={initials} />

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pt-8 md:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9b8ec7]">Tutori</p>
            <h1 className="font-serif text-3xl font-bold text-[#1a1a2e]">Gaseste un tutore</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Alege un profesor real din platforma FII Smart. Lista este construita din conturile cu rol PROFESSOR si cursurile publicate.
            </p>
          </div>
          <div className="relative w-full md:w-[360px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cauta dupa nume sau tag..."
              className="bg-white pl-9"
            />
          </div>
        </div>

        {loading ? (
          <Card className="border-dashed bg-white/60">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Se incarca tutorii...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/30 bg-white">
            <CardContent className="p-8 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        ) : filteredTutors.length === 0 ? (
          <Card className="border-dashed bg-white/60">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Nu exista tutori pentru filtrul ales.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTutors.map((tutor) => (
              <Card key={tutor.id} className="border-border/60 bg-white shadow-sm">
                <CardContent className="flex h-full flex-col gap-5 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#9b8ec7]/15 text-[#9b8ec7]">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-[#1a1a2e]">{tutor.displayName}</h2>
                      {tutor.headline && <p className="text-xs font-semibold text-[#9b8ec7]">{tutor.headline}</p>}
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tutor.bio}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(tutor.tags ?? []).length > 0 ? (
                      tutor.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#9b8ec7]/10 px-2.5 py-1 text-xs font-semibold text-[#5a5470]">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Nu exista taguri publice.</span>
                    )}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-border/60 p-3">
                      <BookOpen className="mb-1 h-4 w-4 text-[#9b8ec7]" />
                      <p className="font-bold text-[#1a1a2e]">{tutor.publishedCourseCount}</p>
                      <p className="text-xs text-muted-foreground">cursuri publicate</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                      <Star className="mb-1 h-4 w-4 text-amber-500" />
                      <p className="font-bold text-[#1a1a2e]">{tutor.avgRating > 0 ? tutor.avgRating : "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{tutor.reviewCount || 0} review-uri</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <span>{tutor.experienceYears || 0} ani experienta</span>
                    <span className="text-right">{tutor.availability || "Disponibilitate neprecizata"}</span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setSelectedTutor(tutor)}
                  >
                    <Send className="h-4 w-4" />
                    Trimite cerere
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Trimite cerere catre {selectedTutor.displayName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Trimite-i profesorului cateva detalii despre ce vrei sa inveti.
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={5}
              className="mt-4 w-full rounded-md border border-border p-3 text-sm outline-none focus:ring-2 focus:ring-[#9b8ec7]"
              placeholder="Scrie ce vrei sa inveti sau cand esti disponibil..."
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedTutor(null);
                  setRequestMessage("");
                }}
              >
                Anuleaza
              </Button>
              <Button type="button" onClick={handleSubmitRequest} disabled={submittingRequest}>
                {submittingRequest ? "Se trimite..." : "Trimite cererea"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
