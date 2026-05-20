import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles, Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchAsFile } from "@/lib/api";
import {
  generateFromPdf,
  type AiPdfGenerateResponse,
  type AiQuizDraft,
  type AiQuizQuestionDraft,
} from "../services/ai.service";

export type ExistingPdfOption = {
  /** Lesson id (used as React key + identity for the picker). */
  id: string;
  /** Lesson title — shown in the picker. */
  title: string;
  /** Stored file URL (typically /api/v1/files/{id}). */
  url: string;
};

type Stage = "pick" | "loading" | "preview";

type Language = "ro" | "en";

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onAccept: (summary: string, quiz: AiQuizDraft) => void;
  /**
   * PDFs already attached to the current module — shown as a picker so
   * the professor can re-use one instead of re-uploading from disk.
   */
  existingPdfs?: ExistingPdfOption[];
}

export function AiGeneratePdfDialog({ open, onOpenChange, onAccept, existingPdfs = [] }: Props) {
  const [stage, setStage] = useState<Stage>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [language, setLanguage] = useState<Language>("ro");
  const [loadingExistingId, setLoadingExistingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [editedSummary, setEditedSummary] = useState<string>("");
  const [editedQuestions, setEditedQuestions] = useState<AiQuizQuestionDraft[]>([]);
  const [quizMeta, setQuizMeta] = useState<{
    title: string;
    passingScore?: number;
    timeLimit?: number;
  }>({ title: "Quiz AI" });

  // Reset all internal state whenever the dialog closes. Also aborts any
  // in-flight Gemini call — a Gemini round-trip can take ~60s and the user
  // expects closing the dialog to actually cancel.
  useEffect(() => {
    if (open) return;
    abortRef.current?.abort();
    abortRef.current = null;
    setStage("pick");
    setFile(null);
    setQuestionCount(5);
    setLanguage("ro");
    setLoadingExistingId(null);
    setEditedSummary("");
    setEditedQuestions([]);
    setQuizMeta({ title: "Quiz AI" });
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    // allow re-picking the same file later, no matter the validation outcome
    event.target.value = "";
    if (!picked) {
      setFile(null);
      return;
    }
    // The accept="application/pdf" attribute is only a filter hint — users
    // can drag-and-drop or override the picker. Validate explicitly so we
    // don't pay the upload round-trip just to get a BE rejection.
    if (picked.type !== "application/pdf") {
      toast.error("Doar fisiere PDF sunt acceptate.");
      setFile(null);
      return;
    }
    const MAX_BYTES = 15 * 1024 * 1024;
    if (picked.size > MAX_BYTES) {
      toast.error("PDF-ul depaseste limita de 15 MB.");
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const handlePickExisting = async (option: ExistingPdfOption) => {
    if (loadingExistingId) return;
    setLoadingExistingId(option.id);
    try {
      // Derive a sane filename: prefer the lesson title, fall back to "lectie.pdf".
      const safeTitle = option.title.trim().replace(/[^\w.\-() ]+/g, "_") || "lectie";
      const filename = safeTitle.toLowerCase().endsWith(".pdf") ? safeTitle : `${safeTitle}.pdf`;
      const fetched = await fetchAsFile(option.url, filename);
      if (fetched.type !== "application/pdf") {
        toast.error("Fisierul atasat lectiei nu este un PDF.");
        return;
      }
      setFile(fetched);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nu am putut incarca PDF-ul existent.",
      );
    } finally {
      setLoadingExistingId(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    const safeCount = Math.min(Math.max(questionCount, 3), 10);
    const controller = new AbortController();
    abortRef.current = controller;
    setStage("loading");
    try {
      const response: AiPdfGenerateResponse = await generateFromPdf(file, {
        questionCount: safeCount,
        language,
        signal: controller.signal,
      });
      setEditedSummary(response.summary);
      setEditedQuestions(response.quiz.questions);
      setQuizMeta({
        title: response.quiz.title || "Quiz AI",
        passingScore: response.quiz.passingScore,
        timeLimit: response.quiz.timeLimit,
      });
      setStage("preview");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled — close-effect already reset state. Do not toast.
        return;
      }
      const message = err instanceof Error ? err.message : "Eroare la generarea cu AI";
      toast.error(message);
      setStage("pick");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const handleAbortLoading = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStage("pick");
  };

  const updateQuestionText = (index: number, text: string) => {
    setEditedQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text } : q)),
    );
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setEditedQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOptions = [...q.options];
        nextOptions[oIndex] = value;
        return { ...q, options: nextOptions };
      }),
    );
  };

  const updateCorrectIdx = (qIndex: number, value: number) => {
    setEditedQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctIdx: value } : q)),
    );
  };

  const updateExplanation = (qIndex: number, value: string) => {
    setEditedQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, explanation: value || undefined } : q,
      ),
    );
  };

  const handleAccept = () => {
    onAccept(editedSummary, {
      title: quizMeta.title,
      passingScore: quizMeta.passingScore,
      timeLimit: quizMeta.timeLimit,
      questions: editedQuestions,
    });
    onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto bg-card p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg sm:text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Genereaza lectie + quiz cu AI
          </DialogTitle>
          <DialogDescription>
            Incarca un PDF; Gemini va produce un rezumat in Markdown si un set de intrebari multiple-choice pe care le poti edita inainte de adaugarea in curs.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="space-y-5 py-4">
            {existingPdfs.length > 0 && (
              <div className="space-y-2">
                <Label>PDF-uri din acest modul</Label>
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-2 max-h-[180px] overflow-y-auto">
                  {existingPdfs.map((option) => {
                    const isLoading = loadingExistingId === option.id;
                    const isSelected =
                      file?.name.replace(/\.pdf$/i, "").toLowerCase() ===
                      option.title.trim().replace(/[^\w.\-() ]+/g, "_").toLowerCase();
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handlePickExisting(option)}
                        disabled={isLoading || loadingExistingId !== null}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-primary/15 text-primary"
                            : "hover:bg-muted text-foreground"
                        } disabled:opacity-60`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate">{option.title}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sau incarca unul nou mai jos.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Document PDF</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 self-start sm:self-auto"
                >
                  <Upload className="h-4 w-4" />
                  {file ? "Schimba PDF" : "Alege PDF"}
                </Button>
                {file && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numar intrebari (3-10)</Label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  value={questionCount}
                  onChange={(event) => {
                    const parsed = parseInt(event.target.value, 10);
                    if (Number.isFinite(parsed)) setQuestionCount(parsed);
                  }}
                  className="bg-muted w-full sm:w-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Limba</Label>
                <RadioGroup
                  value={language}
                  onValueChange={(value) => setLanguage(value as Language)}
                  className="flex flex-wrap items-center gap-4"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="ro" />
                    <span className="text-sm">Romana</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="en" />
                    <span className="text-sm">Engleza</span>
                  </label>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Anuleaza
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!file || questionCount < 3 || questionCount > 10}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Genereaza
              </Button>
            </DialogFooter>
          </div>
        )}

        {stage === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Se genereaza... poate dura pana la 60 de secunde.
            </p>
            <Button variant="outline" size="sm" onClick={handleAbortLoading}>
              Anuleaza
            </Button>
          </div>
        )}

        {stage === "preview" && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Rezumat (Markdown)</Label>
              <Textarea
                value={editedSummary}
                onChange={(event) => setEditedSummary(event.target.value)}
                rows={8}
                className="min-h-[180px] bg-muted text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Intrebari ({editedQuestions.length})
                </Label>
              </div>
              <Accordion type="multiple" defaultValue={["q-0"]} className="space-y-3">
                {editedQuestions.map((q, qIndex) => (
                  <AccordionItem
                    key={qIndex}
                    value={`q-${qIndex}`}
                    className="border border-border rounded-xl px-3 sm:px-4 bg-muted/30"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                        <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-primary/20 text-primary text-sm font-medium">
                          {qIndex + 1}
                        </span>
                        <span className="font-medium text-sm truncate min-w-0 flex-1">
                          {q.text || "Intrebare noua..."}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Textul Intrebarii</Label>
                        <Input
                          value={q.text}
                          onChange={(event) => updateQuestionText(qIndex, event.target.value)}
                          className="bg-card"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Optiuni (selecteaza raspunsul corect)</Label>
                        <RadioGroup
                          value={q.correctIdx.toString()}
                          onValueChange={(value) =>
                            updateCorrectIdx(qIndex, parseInt(value, 10))
                          }
                        >
                          {q.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3 min-w-0">
                              <RadioGroupItem
                                value={oIndex.toString()}
                                className="shrink-0"
                              />
                              <Input
                                value={option}
                                onChange={(event) =>
                                  updateOption(qIndex, oIndex, event.target.value)
                                }
                                className="flex-1 min-w-0 bg-card"
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Explicatie (optional)</Label>
                        <Input
                          value={q.explanation ?? ""}
                          onChange={(event) =>
                            updateExplanation(qIndex, event.target.value)
                          }
                          className="bg-card"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Anuleaza
              </Button>
              <Button onClick={handleAccept} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Adauga in curs
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
