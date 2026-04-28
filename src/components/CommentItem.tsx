import {ThumbsUp, Clock} from 'lucide-react';
import type {StudentCommentDTO} from '../types';

interface ItemProps {
    comment: StudentCommentDTO;
    studentId: string;
    onTimestampClick: (seconds: number) => void;
    onRefresh: () => void;
    activeCommentId: string | null;
}

export default function CommentItem({comment, studentId, onTimestampClick, onRefresh, activeCommentId}: ItemProps) {
    const handleLike = async () => {
        await fetch(`http://localhost:8081/api/students/${studentId}/comments/${comment.commentId}/like`, {method: 'POST'});
        onRefresh();
    };

    return (
        <div
            className={`flex gap-4 p-3 rounded-2xl transition-all ${activeCommentId === comment.commentId ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}>
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${comment.authorRole === 'Profesor' ? 'bg-primary' : 'bg-secondary'}`}>
                {comment.authorName.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 space-y-2">
                <div
                    className={`bg-muted/20 p-4 rounded-2xl border ${comment.authorRole === 'Profesor' ? 'rounded-tl-none border-primary/20' : 'border-border/50'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{comment.authorName}</span>
                            {comment.authorRole === 'Profesor' && (
                                <span
                                    className="px-2 py-0.5 bg-accent/30 text-foreground text-[10px] uppercase font-bold rounded-full tracking-wider">PROFESOR</span>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{comment.body}</p>

                    {comment.videoTimestamp !== undefined && comment.videoTimestamp > 0 && (
                        <button
                            onClick={() => onTimestampClick(comment.videoTimestamp!)}
                            className="mt-2 flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md hover:bg-primary/20 transition-colors"
                        >
                            <Clock size={12}/> {comment.videoTimestamp}s
                        </button>
                    )}
                </div>

                <div className="flex gap-4 ml-2 text-xs font-bold text-muted-foreground">
                    <button onClick={() => {
                        void handleLike();
                    }}
                            className={`flex items-center gap-1.5 hover:text-primary transition-colors ${comment.isLikedByMe ? 'text-primary' : ''}`}>
                        <ThumbsUp size={14} className={comment.isLikedByMe ? 'fill-primary' : ''}/> {comment.likeCount}
                    </button>
                    <button className="hover:text-foreground">Răspunde</button>
                </div>

                {comment.replies && comment.replies.map(reply => (
                    <CommentItem
                        key={reply.commentId}
                        comment={reply}
                        studentId={studentId}
                        onTimestampClick={onTimestampClick}
                        onRefresh={onRefresh}
                        activeCommentId={activeCommentId}
                    />
                ))}
            </div>
        </div>
    );
}