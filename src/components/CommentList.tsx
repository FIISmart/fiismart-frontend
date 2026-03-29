import { Heart, Reply } from 'lucide-react';
import type { CommentPreview } from '../types';

interface CommentListProps {
    comments: CommentPreview[];
}

function getInitials(name: string) {
    if (!name) return '??';
    const words = name.split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export function CommentList({ comments }: CommentListProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-poppins text-edu-foreground">Comentarii Relevante</h3>
                <a href="#" className="text-sm font-medium text-edu-primary hover:text-edu-secondary transition">
                    Vezi toate
                </a>
            </div>

            <div className="bg-edu-card border border-edu-border rounded-2xl shadow-sm flex flex-col">
                {comments.length === 0 ? (
                    <div className="p-8 text-center text-edu-muted-fg font-medium">
                        Nu ai comentarii noi la cursuri.
                    </div>
                ) : (
                    comments.map((comment, index) => {
                        const avatarStyles = [
                            "bg-edu-secondary/40 text-edu-primary",
                            "bg-edu-accent/50 text-edu-foreground",
                            "bg-edu-muted text-edu-muted-fg"
                        ];
                        const currentStyle = avatarStyles[index % avatarStyles.length];

                        const dataFormatata = new Date(comment.createdAt).toLocaleDateString('ro-RO', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        });

                        return (
                            <div key={comment.commentId} className="p-6 border-b border-edu-border last:border-0 hover:bg-edu-bg/30 transition flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${currentStyle}`}>
                                    {getInitials(comment.authorDisplayName)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="font-semibold text-edu-foreground">{comment.authorDisplayName}</span>
                                        <span className="text-edu-border">•</span>
                                        <span className="text-xs font-medium bg-edu-bg px-2 py-0.5 rounded-md text-edu-muted-fg border border-edu-border/50">
                      {comment.courseTitle}
                    </span>
                                        <span className="text-edu-border">•</span>
                                        <span className="text-xs text-edu-muted-fg">{dataFormatata}</span>
                                    </div>

                                    <p className="text-sm text-edu-muted-fg mt-2 leading-relaxed">
                                        {comment.body}
                                    </p>

                                    <div className="flex items-center gap-4 mt-4">
                                        <button className="flex items-center gap-1.5 text-xs font-medium text-edu-muted-fg hover:text-rose-500 transition">
                                            <Heart size={14} />
                                            <span>{comment.likeCount}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-xs font-medium text-edu-muted-fg hover:text-edu-primary transition">
                                            <Reply size={14} />
                                            <span>{comment.repliesCount} Răspunsuri</span>
                                        </button>

                                        {comment.isAnswered && (
                                            <span className="text-xs text-emerald-500 font-medium ml-auto">✓ Răspuns</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}