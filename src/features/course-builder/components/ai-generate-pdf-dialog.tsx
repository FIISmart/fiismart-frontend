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
import { Sparkles, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  generateFromPdf,
  type AiPdfGenerateResponse,
  type AiQuizDraft,
  type AiQuizQuestionDraft,
} from "../services/ai.service";

type Stage = "pick" | "loading" | "preview";

type Language = "ro" | "en";

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onAccept: (summary: string, quiz: AiQuizDraft) => void;
}

export function AiGeneratePdfDialog({ open, onOpenChange, onAccept }: Props) {
  const [stage, setStage] = useState<Stage>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [language, setLanguage] = useState<Language>("ro");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editedSummary, setEditedSummary] = useState<string>("");
  const [editedQuestions, setEditedQuestions] = useState<AiQuizQuestionDraft[]>([]);
  const [quizMeta, setQuizMeta] = useState<{
    title: string;
    passingScore?: number;
    timeLimit?: number;
  }>({ title: "Quiz AI" });

  // Reset all internal state whenever the dialog closes.
  useEffect(() => {
    if (open) return;
    setStage("pick");
    setFile(null);
    setQuestionCount(5);
    setLanguage("ro");
    setEditedSummary("");
    setEditedQuestions([]);
    setQuizMeta({ title: "Quiz AI" });
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    setFile(picked);
    // allow re-picking the same file later
    event.target.value = "";
  };

  const handleGenerate = async () => {
    if (!file) return;
    const safeCount = Math.min(Math.max(questionCount, 3), 10);
    setStage("loading");
    try {
      const response: AiPdfGenerateResponse = await generateFromPdf(file, {
        questionCount: safeCount,
        language,
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
      const message = err instanceof Error ? err.message : "Eroare la generarea cu AI";
      toast.error(message);
      setStage("pick");
    }
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
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg sm:text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Genereaza lectie + quiz cu AI
          </DialogTitle>
        </DialogHeader>

        {stage === "pick" && (
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Document PDF</Label>
              <div className="flex items-center gap-3">
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
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {file ? "Schimba PDF" : "Alege PDF"}
                </Button>
                {file && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2 truncate">
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
                  className="bg-muted w-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Limba</Label>
                <RadioGroup
                  value={language}
                  onValueChange={(value) => setLanguage(value as Language)}
                  className="flex items-center gap-4"
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
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Se genereaza... poate dura pana la 60 de secunde.
            </p>
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
                className="min-h-[180px] bg-muted font-mono text-sm"
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
                    className="border border-border rounded-xl px-4 bg-muted/30"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-medium">
                          {qIndex + 1}
                        </span>
                        <span className="font-medium text-sm truncate max-w-[400px]">
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
                            <div key={oIndex} className="flex items-center gap-3">
                              <RadioGroupItem value={oIndex.toString()} />
                              <Input
                                value={option}
                                onChange={(event) =>
                                  updateOption(qIndex, oIndex, event.target.value)
                                }
                                className="flex-1 bg-card"
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
