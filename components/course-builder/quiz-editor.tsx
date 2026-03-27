"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Plus, Trash2, HelpCircle, CheckCircle2 } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/lib/course-types";
import { generateId } from "@/lib/course-types";

interface QuizEditorProps {
  quiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
  onRemove?: () => void;
  isOpen: boolean;
}

const emptyQuestion = (): QuizQuestion => ({
  id: generateId(),
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
});

export function QuizEditor({ quiz, onSave, onCancel, onRemove, isOpen }: QuizEditorProps) {
  const [title, setTitle] = useState(quiz?.title || "Quiz Modul");
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz?.questions || [emptyQuestion()]
  );

  const handleSave = () => {
    const validQuestions = questions.filter(
      (q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2
    );
    
    if (validQuestions.length === 0) return;

    const newQuiz: Quiz = {
      id: quiz?.id || generateId(),
      title,
      questions: validQuestions,
    };
    onSave(newQuiz);
  };

  const addQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const isValid = title.trim() !== "" && questions.some(
    (q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-card" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {quiz ? "Editează Quiz" : "Adaugă Quiz la Modul"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Titlu Quiz</Label>
            <Input
              id="quiz-title"
              placeholder="ex: Verifică-ți cunoștințele"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Întrebări</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adaugă Întrebare
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["q-0"]} className="space-y-3">
              {questions.map((question, qIndex) => (
                <AccordionItem
                  key={question.id}
                  value={`q-${qIndex}`}
                  className="border border-border rounded-xl px-4 bg-muted/30"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        {qIndex + 1}
                      </span>
                      <span className="font-medium text-sm truncate max-w-[400px]">
                        {question.question || "Întrebare nouă..."}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Textul Întrebării</Label>
                      <Textarea
                        placeholder="Scrie întrebarea aici..."
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(qIndex, { question: e.target.value })
                        }
                        className="bg-card"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Opțiuni de Răspuns</Label>
                      <RadioGroup
                        value={question.correctAnswer.toString()}
                        onValueChange={(v) =>
                          updateQuestion(qIndex, { correctAnswer: parseInt(v) })
                        }
                      >
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <RadioGroupItem
                              value={oIndex.toString()}
                              id={`q${qIndex}-o${oIndex}`}
                            />
                            <Input
                              placeholder={`Opțiunea ${oIndex + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateOption(qIndex, oIndex, e.target.value)
                              }
                              className="flex-1 bg-card"
                            />
                            {question.correctAnswer === oIndex && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground">
                        Selectează răspunsul corect folosind butonul radio
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Explicație (opțional)</Label>
                      <Textarea
                        placeholder="Explică de ce acest răspuns este corect..."
                        value={question.explanation || ""}
                        onChange={(e) =>
                          updateQuestion(qIndex, { explanation: e.target.value })
                        }
                        className="bg-card"
                        rows={2}
                      />
                    </div>

                    {questions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive gap-2"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Șterge Întrebarea
                      </Button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {quiz && onRemove && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive sm:mr-auto"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Șterge Quiz
            </Button>
          )}
          <Button variant="outline" onClick={onCancel}>
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {quiz ? "Salvează Modificările" : "Adaugă Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
