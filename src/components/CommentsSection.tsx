
import { MessageSquare, ThumbsUp, Clock, Send } from 'lucide-react';
import type {CourseComment} from '../types';

const mockComments: CourseComment[] = [
    {
        commentId: 'c1',
        authorName: 'Prof. Andrei Popescu',
        authorRole: 'Profesor',
        body: 'Bine ați venit la curs! Dacă aveți întrebări despre setup, nu ezitați să le puneți aici.',
        likeCount: 12,
        timeAgo: 'Acum 2 zile',
        isLikedByMe: true,
    },
    {
        commentId: 'c2',
        authorName: 'Alexandru Popa',
        body: 'Nu reușesc să rulez comanda de instalare, îmi dă o eroare de permisiuni pe Windows.',
        timestampSecs: 252,
        likeCount: 3,
        timeAgo: 'Acum 5 ore',
        isLikedByMe: false,
    }
];

export default function CommentsSection() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-heading font-bold text-xl flex items-center gap-2 text-foreground">
                    <MessageSquare size={24} className="text-primary" />
                    Discuții & Întrebări
                </h3>
                <span className="px-3 py-1 bg-accent/30 text-foreground text-sm font-medium rounded-full">
          {mockComments.length} comentarii
        </span>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl border border-border">
        <textarea
            placeholder="Pune o întrebare sau lasă un comentariu..."
            className="w-full bg-muted border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none h-24 mb-3"
        />
                <div className="flex justify-between items-center">
                    <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 bg-card rounded-lg border border-border">
                        <Clock size={14} />
                        Adaugă timestamp (04:12)
                    </button>

                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                        <Send size={16} />
                        Postează
                    </button>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                {mockComments.map((comment) => (
                    <div key={comment.commentId} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${comment.authorRole === 'Profesor' ? 'bg-primary' : 'bg-secondary'}`}>
                            {comment.authorName.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1">
                            <div className="bg-muted/20 p-4 rounded-2xl rounded-tl-none border border-border/50">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-foreground">{comment.authorName}</span>
                                        {comment.authorRole === 'Profesor' && (
                                            <span className="px-2 py-0.5 bg-accent/30 text-foreground text-[10px] uppercase font-bold rounded-full tracking-wider">
                        {comment.authorRole}
                      </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {comment.body}
                                </p>

                                {comment.timestampSecs && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md cursor-pointer hover:bg-primary/20 transition-colors">
                                        <Clock size={12} />
                                        04:12
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-2 ml-2 text-xs font-medium text-muted-foreground">
                                <button className={`flex items-center gap-1.5 hover:text-primary transition-colors ${comment.isLikedByMe ? 'text-primary' : ''}`}>
                                    <ThumbsUp size={14} className={comment.isLikedByMe ? 'fill-primary' : ''} />
                                    {comment.likeCount}
                                </button>
                                <button className="hover:text-foreground transition-colors">
                                    Răspunde
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}