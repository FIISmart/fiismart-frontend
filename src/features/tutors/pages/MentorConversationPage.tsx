import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getMentorConversationMessages,
  getTutorRequestConversation,
  sendMentorConversationMessage,
  type MentorConversationAPI,
  type MentorMessageAPI,
} from "@/lib/api";
import { toast } from "sonner";

export default function MentorConversationPage() {
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProfessor = location.pathname.startsWith("/professor");
  const [conversation, setConversation] = useState<MentorConversationAPI | null>(null);
  const [messages, setMessages] = useState<MentorMessageAPI[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (conversationId: string) => {
    const data = await getMentorConversationMessages(conversationId);
    setMessages(data ?? []);
  }, []);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getTutorRequestConversation(requestId)
      .then(async (data) => {
        if (cancelled) return;
        setConversation(data);
        setMessages(data.messages ?? []);
        await loadMessages(data.id);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Nu am putut încărca conversația.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadMessages, requestId]);

  useEffect(() => {
    if (!conversation?.id) return;
    const timer = window.setInterval(() => {
      loadMessages(conversation.id).catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [conversation?.id, loadMessages]);

  const peerName = useMemo(() => {
    if (!conversation) return isProfessor ? "student" : "mentor";
    return isProfessor ? conversation.studentName || "Student" : conversation.tutorName || "Mentor";
  }, [conversation, isProfessor]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!conversation?.id || !trimmed || isSending) return;
    setIsSending(true);
    try {
      const sent = await sendMentorConversationMessage(conversation.id, trimmed);
      setMessages((prev) => [...prev, sent]);
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mesajul nu a putut fi trimis.");
    } finally {
      setIsSending(false);
    }
  };

  const firstName = user?.firstName || "Student";
  const initials = `${user?.firstName?.[0] ?? "S"}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className={isProfessor ? "min-h-screen bg-edu-bg text-edu-foreground" : "min-h-screen bg-[#F4EFE8] text-[#1a1a2e]"}>
      {isProfessor ? <ProfDashboardNavbar /> : <StudentNavbar studentName={firstName} initials={initials} />}
      <main className="mx-auto flex w-full max-w-[980px] flex-col gap-5 px-4 py-8 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9b8ec7]">Conversație mentorat</p>
            <h1 className="font-serif text-3xl font-bold">Chat cu {peerName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mesajele sunt salvate și pot fi reluate după refresh.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isProfessor ? "/professor/mentor-requests" : "/student/mentor-requests")}
          >
            Înapoi la cereri
          </Button>
        </div>

        {isLoading && <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă conversația...</CardContent></Card>}
        {error && <Card><CardContent className="p-8 text-center text-red-600">{error}</CardContent></Card>}

        {!isLoading && !error && conversation && (
          <Card className="bg-white">
            <CardContent className="flex min-h-[560px] flex-col p-0">
              <div className="border-b border-border px-5 py-4">
                <p className="font-semibold">{peerName}</p>
                <p className="text-xs text-muted-foreground">Cerere #{conversation.requestId}</p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                {messages.length === 0 && (
                  <p className="rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                    Nu există mesaje încă. Scrie primul mesaj pentru a începe conversația.
                  </p>
                )}
                {messages.map((message) => {
                  const mine = message.senderId === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${mine ? "bg-[#9b8ec7] text-white" : "bg-[#f3f0ea] text-[#1a1a2e]"}`}>
                        <p className="mb-1 text-xs font-semibold opacity-80">{message.senderName || (mine ? "Tu" : peerName)}</p>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <p className="mt-2 text-[11px] opacity-70">
                          {message.createdAt ? new Date(message.createdAt).toLocaleString("ro-RO") : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submit} className="flex gap-3 border-t border-border p-4">
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={2}
                  maxLength={4000}
                  placeholder="Scrie un mesaj..."
                  className="min-h-[48px] flex-1 resize-none rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#9b8ec7]"
                />
                <Button type="submit" disabled={!text.trim() || isSending} className="self-end gap-2">
                  <Send className="h-4 w-4" />
                  Trimite
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
