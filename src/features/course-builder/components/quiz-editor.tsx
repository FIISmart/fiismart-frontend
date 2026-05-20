import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, HelpCircle } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/lib/course-types";
import { generateId } from "@/lib/course-types";
import { toast } from "sonner";

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
    const validQuestions = questions.filter((q) => {
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
      // For written, ensure there is a non-empty string answer
      const hasAnswer = typeof q.correctAnswer === "string" && q.correctAnswer.trim() !== "";
      if (!hasAnswer && !validationMessageShown) {
        toast.error("Adauga raspunsul corect pentru intrebarea scrisa.");
        validationMessageShown = true;
      }
      return hasAnswer;
    });
    
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
                          onValueChange={(v) => updateQuestion(qIndex, {
                            type: v as QuizQuestion["type"],
                            correctAnswer: v === "written" ? "" : 0,
                          })}
                        >
                          <SelectTrigger className="bg-card w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Alegere Multiplă</SelectItem>
                            {supportsWritten && (
                              <SelectItem value="written">Răspuns Scris</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {q.type === "multiple_choice" ? (
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
                    ) : (
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
