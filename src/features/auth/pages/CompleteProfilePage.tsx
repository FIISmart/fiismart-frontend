import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, GraduationCap, Loader2, BookOpen, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationState {
  firstName?: string;
  lastName?: string;
}

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const { assignRole } = useAuth();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [firstName, setFirstName] = useState(state.firstName ?? "");
  const [lastName, setLastName] = useState(state.lastName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = selected !== null && firstName.trim().length > 0;

  const handleContinue = async () => {
    if (!selected || !canContinue) return;
    setLoading(true);
    setError(null);
    try {
      const user = await assignRole(selected, firstName.trim(), lastName.trim());
      toast.success(`Bun venit pe FIISmart, ${user.firstName || user.email}!`);
      let dest = "/student/dashboard";
      if (user.role === "PROFESSOR") dest = "/professor/dashboard";
      if (user.role === "ADMIN") dest = "/admin/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "A apărut o eroare. Încearcă din nou.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-edu-bg p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <span className="grid place-items-center size-11 rounded-xl bg-edu-purple text-white">
            <GraduationCap className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-edu-foreground">FIISmart</span>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-serif">Finalizează profilul</CardTitle>
            <CardDescription>
              Completează datele de mai jos pentru a continua.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prenume <span className="text-destructive">*</span></Label>
                <Input
                  id="firstName"
                  placeholder="Ion"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nume</Label>
                <Input
                  id="lastName"
                  placeholder="Popescu"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <Label>Rol pe platformă <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelected(UserRole.STUDENT)}
                  className={[
                    "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-purple",
                    selected === UserRole.STUDENT
                      ? "border-edu-purple bg-edu-purple/8 text-edu-purple"
                      : "border-border hover:border-edu-purple/50 hover:bg-muted/40 text-foreground",
                  ].join(" ")}
                >
                  <span className={[
                    "grid place-items-center size-12 rounded-xl",
                    selected === UserRole.STUDENT ? "bg-edu-purple/15" : "bg-muted",
                  ].join(" ")}>
                    <BookOpen className="size-6" />
                  </span>
                  <span className="font-semibold text-sm">Student</span>
                  <span className="text-xs text-muted-foreground text-center leading-relaxed">
                    Accesează cursuri și quiz-uri
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelected(UserRole.PROFESSOR)}
                  className={[
                    "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-purple",
                    selected === UserRole.PROFESSOR
                      ? "border-edu-purple bg-edu-purple/8 text-edu-purple"
                      : "border-border hover:border-edu-purple/50 hover:bg-muted/40 text-foreground",
                  ].join(" ")}
                >
                  <span className={[
                    "grid place-items-center size-12 rounded-xl",
                    selected === UserRole.PROFESSOR ? "bg-edu-purple/15" : "bg-muted",
                  ].join(" ")}>
                    <Users className="size-6" />
                  </span>
                  <span className="font-semibold text-sm">Profesor</span>
                  <span className="text-xs text-muted-foreground text-center leading-relaxed">
                    Creează și gestionează cursuri
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
                <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              disabled={!canContinue || loading}
              onClick={handleContinue}
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" />Se salvează…</>
              ) : (
                "Continuă"
              )}
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Contul tău Google a fost conectat cu succes.
        </p>
      </div>
    </div>
  );
}
