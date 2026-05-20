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
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-[700px] max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {quiz ? "Editează Quiz" : "Adaugă Quiz la Modul"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Titlu Quiz</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Întrebări</Label>
              <Button variant="outline" size="sm" onClick={addQuestion} className="gap-2">
                <Plus className="h-4 w-4" /> Adaugă Întrebare
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["q-0"]} className="space-y-3">
              {questions.map((q, qIndex) => (
                <AccordionItem key={q.id} value={`q-${qIndex}`} className="border border-border rounded-xl px-4 bg-muted/30">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        {qIndex + 1}
                      </span>
                      <span className="font-medium text-sm truncate max-w-[400px]">
                        {q.question || "Întrebare nouă..."}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Textul Întrebării</Label>
                        <Textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                          className="bg-card"
                        />
                      </div>
                      <div className="w-full sm:w-48 space-y-2">
                        <Label>Tip Răspuns</Label>
                        <Select 
                          value={q.type} 
                          onValueChange={(v: any) => updateQuestion(qIndex, { 
                            type: v, 
                            correctAnswer: v === "written" ? "" : 0 
                          })}
                        >
                          <SelectTrigger className="bg-card">
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
                        <Label>Opțiuni</Label>
                        <RadioGroup
                          value={q.correctAnswer.toString()}
                          onValueChange={(v) => updateQuestion(qIndex, { correctAnswer: parseInt(v) })}
                        >
                          {(q.options ?? []).map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <RadioGroupItem value={oIndex.toString()} />
                              <Input
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className="flex-1 bg-card"
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
                        <p className="text-xs text-muted-foreground">Studentul trebuie să introducă exact acest text.</p>
                      </div>
                    )}

                    <Button variant="ghost" size="sm" className="text-destructive mt-2" onClick={() => removeQuestion(qIndex)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Șterge Întrebarea
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {quiz && onRemove && (
            <Button variant="ghost" className="text-destructive sm:mr-auto" onClick={onRemove}>
              <Trash2 className="h-4 w-4 mr-2" /> Șterge Quiz
            </Button>
          )}
          <Button variant="outline" onClick={onCancel}>Anulează</Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving ? "Se salveaza..." : "Salvează"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
