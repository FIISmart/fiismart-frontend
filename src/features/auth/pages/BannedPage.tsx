import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function BannedPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-edu-bg px-6 py-12">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto grid place-items-center size-20 rounded-full bg-destructive/10 ring-1 ring-destructive/20">
          <Ban className="size-10 text-destructive" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-semibold text-edu-foreground">
            Cont suspendat
          </h1>
          <p className="text-muted-foreground">
            Contul tău a fost suspendat de un administrator și nu mai poți accesa platforma FII Smart.
          </p>
          {user?.banReason && (
            <div className="mt-2 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive text-left">
              <span className="font-semibold">Motiv:</span> {user.banReason}
            </div>
          )}
          <p className="text-sm text-muted-foreground pt-2">
            Dacă crezi că este o greșeală, contactează administratorii platformei.
          </p>
        </div>

        <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
          Deconectare
        </Button>
      </div>
    </div>
  );
}

