import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import {
  getProfessorComments,
  replyToProfessorComment,
  updateProfessorCommentStatus,
  type ProfessorCommentAPI,
} from "@/lib/api";

export default function ProfessorCommentsPage() {
  const [comments, setComments] = useState<ProfessorCommentAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfessorComments()
      .then((data) => {
        if (!cancelled) setComments(data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Nu am putut incarca comentariile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submitReply = async (event: FormEvent, commentId: string) => {
    event.preventDefault();
    const body = (replyText[commentId] || "").trim();
    if (!body) {
      toast.error("Raspunsul nu poate fi gol.");
      return;
    }
    setSavingId(commentId);
    try {
      const updated = await replyToProfessorComment(commentId, body);
      setComments((current) => current.map((comment) => comment.commentId === commentId ? updated : comment));
      setReplyText((current) => ({ ...current, [commentId]: "" }));
      toast.success("Raspunsul a fost trimis.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut trimite raspunsul.");
    } finally {
      setSavingId(null);
    }
  };

  const markResolved = async (commentId: string) => {
    setSavingId(commentId);
    try {
      const updated = await updateProfessorCommentStatus(commentId, "RESOLVED");
      setComments((current) => current.map((comment) => comment.commentId === commentId ? updated : comment));
      toast.success("Comentariul a fost marcat ca rezolvat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut actualiza statusul.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-edu-bg">
      <ProfDashboardNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-edu-primary">Comentarii</p>
            <h1 className="font-serif text-3xl font-bold text-edu-foreground">Comentariile studentilor</h1>
            <p className="mt-2 max-w-2xl text-sm text-edu-muted-fg">
              Vezi intrebarile primite pe lectii si raspunde direct dintr-un singur loc.
            </p>
          </div>
        </div>

        {loading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Se incarca...</CardContent></Card>
        ) : error ? (
          <Card><CardContent className="p-8 text-center text-destructive">{error}</CardContent></Card>
        ) : comments.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Nu ai comentarii noi la cursuri.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.commentId} className="bg-white">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Link to={`/users/${comment.authorId}`} className="font-semibold text-edu-foreground hover:text-edu-primary">
                          {comment.authorDisplayName || "Student"}
                        </Link>
                        <span className="text-muted-foreground">in</span>
                        <span className="rounded-full bg-edu-bg px-2 py-0.5 text-xs font-semibold text-edu-muted-fg">
                          {comment.courseTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString("ro-RO")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-edu-muted-fg">{comment.body}</p>
                    </div>
                    <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {comment.status || (comment.isAnswered || comment.answered ? "ANSWERED" : "OPEN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {comment.repliesCount} raspunsuri</span>
                    <Button type="button" variant="ghost" size="sm" disabled={savingId === comment.commentId} onClick={() => markResolved(comment.commentId)}>
                      Marcheaza rezolvat
                    </Button>
                  </div>

                  <form onSubmit={(event) => submitReply(event, comment.commentId)} className="flex flex-col gap-3 sm:flex-row">
                    <textarea
                      value={replyText[comment.commentId] || ""}
                      onChange={(event) => setReplyText((current) => ({ ...current, [comment.commentId]: event.target.value }))}
                      rows={2}
                      className="min-h-[48px] flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Scrie raspunsul pentru student..."
                    />
                    <Button type="submit" disabled={savingId === comment.commentId} className="gap-2">
                      <Send className="h-4 w-4" />
                      Raspunde
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
