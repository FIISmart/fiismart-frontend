import { useEffect, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, HelpCircle, X } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/lib/course-types";
import { generateId } from "@/lib/course-types";
import { toast } from "sonner";

/** Default pass threshold (%) for newly-created free_text questions. */
const DEFAULT_PASS_THRESHOLD = 70;

/** Maximum number of key-concept chips per free_text question. */
const MAX_KEY_CONCEPTS = 15;
/** Maximum length of a single key-concept chip (characters). */
const MAX_CONCEPT_LENGTH = 80;

interface QuizEditorProps {
  quiz?: Quiz;
  onSave: (quiz: Quiz) => void | Promise<void>;
  onCancel: () => void;
  onRemove?: () => void;
  isOpen: boolean;
  supportsWritten?: boolean;
}

const emptyQuestion = (): QuizQuestion => ({
  id: generateId(),
  question: "",
  type: "multiple_choice", // Default type
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
});

export function QuizEditor({
  quiz,
  onSave,
  onCancel,
  onRemove,
  isOpen,
  supportsWritten = false,
}: QuizEditorProps) {
  const [title, setTitle] = useState(quiz?.title || "Quiz Modul");
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz?.questions || [emptyQuestion()]
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(quiz?.title || "Quiz Modul");
    setQuestions(quiz?.questions?.length ? quiz.questions : [emptyQuestion()]);
  }, [isOpen, quiz]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Titlul quiz-ului nu poate fi gol.");
      return;
    }

    let validationMessageShown = false;
    const validQuestions = questions
      .filter((q) => {
        if (!q.question.trim()) {
          if (!validationMessageShown) {
            toast.error("Adauga textul intrebarii.");
            validationMessageShown = true;
          }
          return false;
        }
        if (q.type === "multiple_choice") {
          const filledOptions = (q.options ?? []).filter((o) => o.trim());
          if (filledOptions.length < 2 && !validationMessageShown) {
            toast.error("Adauga cel putin doua optiuni pentru intrebarea grila.");
            validationMessageShown = true;
          }
          return filledOptions.length >= 2;
        }
        if (q.type === "free_text") {
          // For AI-graded questions we require a non-empty model answer AND
          // at least one key concept. Without these the BE has nothing to
          // grade against and the AI will reject the request.
          const hasSample = (q.sampleAnswer ?? "").trim() !== "";
          const hasConcepts = (q.keyConcepts ?? []).length >= 1;
          if (!hasSample && !validationMessageShown) {
            toast.error("Adauga un raspuns model pentru intrebarea AI.");
            validationMessageShown = true;
          } else if (!hasConcepts && !validationMessageShown) {
            toast.error("Adauga cel putin un concept cheie pentru intrebarea AI.");
            validationMessageShown = true;
          }
          return hasSample && hasConcepts;
        }
        // For legacy 'written', ensure there is a non-empty string answer
        const hasAnswer = typeof q.correctAnswer === "string" && q.correctAnswer.trim() !== "";
        if (!hasAnswer && !validationMessageShown) {
          toast.error("Adauga raspunsul corect pentru intrebarea scrisa.");
          validationMessageShown = true;
        }
        return hasAnswer;
      })
      // Default passThreshold for any free_text question that was created
      // without ever touching the slider. We do this on save (not as part of
      // updateQuestion) so the user can see the default reflected in the UI.
      .map((q) =>
        q.type === "free_text"
          ? { ...q, passThreshold: q.passThreshold ?? DEFAULT_PASS_THRESHOLD }
          : q,
      );

    if (validQuestions.length === 0) return;

    setIsSaving(true);
    try {
      await onSave({
        id: quiz?.id || generateId(),
        title: title.trim(),
        passingScore: quiz?.passingScore,
        timeLimit: quiz?.timeLimit,
        shuffleQuestions: quiz?.shuffleQuestions,
        questions: validQuestions,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  };

 const updateOption = (qIdx: number, oIdx: number, val: string) => {
  const newQuestions = [...questions];
  const currentOptions = [...(newQuestions[qIdx].options ?? ["", "", "", ""])];
  currentOptions[oIdx] = val;
  newQuestions[qIdx].options = currentOptions;
  setQuestions(newQuestions);
};

  const isValid = title.trim() !== "" && questions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto bg-card p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg sm:text-xl flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">{quiz ? "Editează Quiz" : "Adaugă Quiz la Modul"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Titlu Quiz</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-base font-semibold">Întrebări ({questions.length})</Label>
              <Button variant="outline" size="sm" onClick={addQuestion} className="gap-2">
                <Plus className="h-4 w-4" /> Adaugă Întrebare
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["q-0"]} className="space-y-3">
              {questions.map((q, qIndex) => (
                <AccordionItem
                  key={q.id}
                  value={`q-${qIndex}`}
                  className="border border-border rounded-xl px-3 sm:px-4 bg-muted/30"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                      <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        {qIndex + 1}
                      </span>
                      <span className="font-medium text-sm truncate min-w-0 flex-1">
                        {q.question || "Întrebare nouă..."}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <Label>Textul Întrebării</Label>
                        <Textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                          className="bg-card min-h-[80px]"
                        />
                      </div>
                      <div className="w-full sm:w-48 sm:shrink-0 space-y-2">
                        <Label>Tip Răspuns</Label>
                        <Select
                          value={q.type}
                          onValueChange={(v) => {
                            const nextType = v as QuizQuestion["type"];
                            // Reset correctAnswer to a shape matching the new type.
                            // For free_text we leave correctAnswer alone (it's
                            // unused) and seed the free_text-specific fields if
                            // they have never been touched. We intentionally do
                            // NOT clear free_text fields when switching away so
                            // toggling back preserves the user's work.
                            const patch: Partial<QuizQuestion> = {
                              type: nextType,
                              correctAnswer:
                                nextType === "multiple_choice" ? 0 : "",
                            };
                            if (nextType === "free_text") {
                              if (q.sampleAnswer === undefined) patch.sampleAnswer = "";
                              if (q.keyConcepts === undefined) patch.keyConcepts = [];
                              if (q.passThreshold === undefined)
                                patch.passThreshold = DEFAULT_PASS_THRESHOLD;
                            }
                            updateQuestion(qIndex, patch);
                          }}
                        >
                          <SelectTrigger className="bg-card w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Alegere Multiplă</SelectItem>
                            {supportsWritten && (
                              <SelectItem value="written">Răspuns Scris</SelectItem>
                            )}
                            <SelectItem value="free_text">Răspuns Liber (AI)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {q.type === "multiple_choice" && (
                      <div className="space-y-3">
                        <Label>Opțiuni (selectează răspunsul corect)</Label>
                        <RadioGroup
                          value={String(q.correctAnswer)}
                          onValueChange={(v) => updateQuestion(qIndex, { correctAnswer: parseInt(v, 10) })}
                        >
                          {(q.options ?? []).map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3 min-w-0">
                              <RadioGroupItem value={oIndex.toString()} className="shrink-0" />
                              <Input
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Opțiunea ${oIndex + 1}`}
                                className="flex-1 min-w-0 bg-card"
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {q.type === "written" && (
                      <div className="space-y-2">
                        <Label>Răspuns Corect (Cuvânt Cheie)</Label>
                        <Input
                          placeholder="ex: ADN"
                          value={q.correctAnswer as string}
                          onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                          className="bg-card"
                        />
                        <p className="text-xs text-muted-foreground">
                          Studentul trebuie să introducă exact acest text (case-insensitive, fără spații la capete).
                        </p>
                      </div>
                    )}

                    {q.type === "free_text" && (
                      <FreeTextFields
                        question={q}
                        onChange={(updates) => updateQuestion(qIndex, updates)}
                      />
                    )}

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeQuestion(qIndex)}
                        disabled={questions.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Șterge Întrebarea
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          {quiz && onRemove && (
            <Button
              variant="ghost"
              className="text-destructive w-full sm:w-auto sm:mr-auto"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Șterge Quiz
            </Button>
          )}
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Anulează
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Se salvează..." : "Salvează"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FreeTextFieldsProps {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}

/**
 * Editor block for a free_text (AI-graded) question. Owns its own draft state
 * for the in-progress concept chip so a half-typed concept doesn't propagate
 * into the saved question on every keystroke. Commits on Enter / comma / blur.
 */
function FreeTextFields({ question, onChange }: FreeTextFieldsProps) {
  const [conceptDraft, setConceptDraft] = useState("");
  const concepts = question.keyConcepts ?? [];
  const threshold = question.passThreshold ?? DEFAULT_PASS_THRESHOLD;

  const commitConcept = () => {
    // Split on newline or comma so a paste like "alpha\nbeta, gamma" commits
    // as three chips, not one giant string.
    const tokens = conceptDraft
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) {
      setConceptDraft("");
      return;
    }
    // De-dupe case-insensitively but preserve the user's casing for new items.
    const seen = new Set(concepts.map((c) => c.toLowerCase()));
    const additions: string[] = [];
    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      additions.push(token);
    }
    if (additions.length > 0) {
      // Cap total chips at MAX_KEY_CONCEPTS and per-chip length to keep the
      // payload bounded for the BE/AI grader.
      const next = [...concepts, ...additions]
        .slice(0, MAX_KEY_CONCEPTS)
        .map((t) => t.slice(0, MAX_CONCEPT_LENGTH));
      onChange({ keyConcepts: next });
    }
    setConceptDraft("");
  };

  const removeConcept = (index: number) => {
    onChange({ keyConcepts: concepts.filter((_, i) => i !== index) });
  };

  const handleConceptKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitConcept();
    } else if (event.key === "Backspace" && conceptDraft === "" && concepts.length > 0) {
      // Quality-of-life: backspace on an empty input removes the last chip.
      removeConcept(concepts.length - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`sample-${question.id}`}>Răspuns model (Sample)</Label>
        <Textarea
          id={`sample-${question.id}`}
          value={question.sampleAnswer ?? ""}
          onChange={(e) => onChange({ sampleAnswer: e.target.value })}
          className="bg-card min-h-[100px]"
          placeholder="Scrie un răspuns model complet și corect."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`concepts-${question.id}`}>Concepte cheie</Label>
        <Input
          id={`concepts-${question.id}`}
          value={conceptDraft}
          onChange={(e) => setConceptDraft(e.target.value)}
          onKeyDown={handleConceptKeyDown}
          onBlur={commitConcept}
          placeholder="Tastează un concept și apasă Enter sau virgulă"
          className="bg-card"
        />
        {concepts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {concepts.map((concept, index) => (
              <Badge
                key={`${concept}-${index}`}
                variant="secondary"
                className="gap-1 pl-2 pr-1 py-1"
              >
                <span>{concept}</span>
                <button
                  type="button"
                  onClick={() => removeConcept(index)}
                  className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
                  aria-label={`Șterge conceptul ${concept}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`threshold-${question.id}`}>Prag de trecere</Label>
          <span className="text-sm font-medium text-muted-foreground">
            Prag: {threshold}%
          </span>
        </div>
        <Slider
          id={`threshold-${question.id}`}
          value={[threshold]}
          min={50}
          max={100}
          step={5}
          onValueChange={(values) => {
            const v = values[0];
            if (typeof v === "number") onChange({ passThreshold: v });
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        AI va evalua răspunsurile studenților comparând cu răspunsul model și
        conceptele cheie.
      </p>
    </div>
  );
}
