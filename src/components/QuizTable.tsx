import { MoreVertical } from 'lucide-react';
import type { QuizPreview } from '../types';

interface QuizTableProps {
    quizzes: QuizPreview[];
}

export function QuizTable({ quizzes }: QuizTableProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-poppins text-edu-foreground">Quiz-urile Mele</h3>
                <a href="#" className="text-sm font-medium text-edu-primary hover:text-edu-secondary transition">
                    Vezi toate
                </a>
            </div>

            <div className="bg-edu-card border border-edu-border rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-edu-bg/50 border-b border-edu-border text-sm font-medium text-edu-muted-fg">
                    <tr>
                        <th className="py-4 px-6 font-medium">Titlu Quiz</th>
                        <th className="py-4 px-6 font-medium">Curs</th>
                        <th className="py-4 px-6 font-medium">Încercări</th>
                        <th className="py-4 px-6 font-medium">Scor Mediu</th>
                        <th className="py-4 px-6 font-medium">Status</th>
                        <th className="py-4 px-6 font-medium text-right">Acțiuni</th>
                    </tr>
                    </thead>

                    <tbody className="text-sm text-edu-foreground">
                    {quizzes.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-edu-muted-fg">Nu ai niciun quiz creat momentan.</td>
                        </tr>
                    ) : (
                        quizzes.map((quiz) => (
                            <tr key={quiz.quizId} className="border-b border-edu-border last:border-0 hover:bg-edu-bg/30 transition">
                                <td className="py-4 px-6 font-medium">{quiz.title}</td>
                                <td className="py-4 px-6 text-edu-muted-fg">{quiz.courseTitle}</td>
                                <td className="py-4 px-6">{quiz.attemptsCount}</td>

                                <td className={`py-4 px-6 font-semibold ${quiz.avgScorePct >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {quiz.avgScorePct}%
                                </td>

                                <td className={`py-4 px-6 font-semibold ${quiz.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {quiz.status === 'active' ? 'Activ' : 'Draft'}
                                </td>

                                <td className="py-4 px-6 text-right">
                                    <button className="text-edu-muted-fg hover:text-edu-primary transition p-1 rounded-md hover:bg-edu-bg">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}