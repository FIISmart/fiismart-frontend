import { useState, useEffect, type FormEvent } from "react";
import { Star, Send, MessageSquareQuote } from "lucide-react";
import { lessonVideoService } from "../services/lesson-video.service";
import type { ReviewResponse } from "../types";

interface ReviewSectionProps {
    studentId: string;
    courseId: string;
    lectureId: string;
    isPreview?: boolean; // <-- Asigură-te că ai asta aici
}

export function ReviewSection({ studentId, courseId, lectureId, isPreview = false }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);

    // Stări pentru formular
    const [rating, setRating] = useState<number>(5);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");

    const [hasReviewed, setHasReviewed] = useState(false);
    const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Preluare recenzii + Verificare status
    useEffect(() => {
        let mounted = true;

        Promise.all([
            lessonVideoService.getReviews(studentId, courseId, lectureId),
            // Dacă e preview, setăm automat reviewed: false ca să nu mai facem request degeaba
            isPreview ? Promise.resolve({ reviewed: false }) : lessonVideoService.checkReviewExists(studentId, courseId)
        ]).then(([data, existsData]) => {
            if (!mounted) return;
            setReviews(data);
            setHasReviewed(existsData.reviewed);

            if (existsData.reviewed) {
                const existing = data.find(r => r.studentId === studentId);
                if (existing) {
                    setExistingReviewId(existing.id);
                    setRating(existing.stars);
                    setComment(existing.body);
                }
            }
            setLoading(false);
        }).catch((error) => {
            console.error("Eroare la preluarea recenziilor:", error);
            if (mounted) setLoading(false);
        });

        return () => { mounted = false; };
    }, [studentId, courseId, lectureId, isPreview]);

    // Adăugare sau Editare recenzie
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isPreview || !comment.trim()) return; // Extra siguranță: blocăm submit-ul în preview

        setIsSubmitting(true);
        try {
            if (hasReviewed && existingReviewId) {
                await lessonVideoService.updateReview(existingReviewId, { stars: rating, body: comment });
                setReviews(prev => prev.map(r =>
                    r.id === existingReviewId ? { ...r, stars: rating, body: comment } : r
                ));
            } else {
                const newReview = await lessonVideoService.addReview(studentId, courseId, lectureId, { rating, comment });
                setReviews(prev => [newReview, ...prev]);
                setHasReviewed(true);
                setExistingReviewId(newReview.id);
            }
        } catch (error) {
            console.error("Eroare la trimiterea recenziei:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground font-medium">Se încarcă recenziile...</div>;
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                    <MessageSquareQuote size={24} className="text-primary" />
                    Recenzii
                </h3>
                <span className="px-3 py-1 bg-accent/30 text-foreground text-sm font-medium rounded-full">
                    {reviews.length} {reviews.length === 1 ? 'recenzie' : 'recenzii'}
                </span>
            </div>

            {/* FORMULAR ADĂUGARE/EDITARE - Ascuns complet dacă isPreview este true */}
            {!isPreview && (
                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        {hasReviewed && (
                            <p className="text-xs font-semibold text-primary mb-3 bg-primary/10 w-fit px-2 py-1 rounded">
                                Ai lăsat deja o recenzie. O poți actualiza mai jos.
                            </p>
                        )}

                        <div className="flex items-center gap-3 mb-3 px-1">
                            <span className="text-sm font-medium text-muted-foreground">Evaluează lecția:</span>
                            <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                                {[1, 2, 3, 4, 5].map((starValue) => {
                                    const isFilled = (hoveredRating || rating) >= starValue;
                                    return (
                                        <button
                                            key={starValue}
                                            type="button"
                                            onClick={() => setRating(starValue)}
                                            onMouseEnter={() => setHoveredRating(starValue)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={20}
                                                className={isFilled ? "text-primary" : "text-muted-foreground/30"}
                                                fill={isFilled ? "currentColor" : "none"}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="text-xs font-bold text-foreground ml-2">
                                {hoveredRating || rating} / 5
                            </span>
                        </div>

                        <textarea
                            placeholder="Cum ți s-a părut această lecție? Explică ce ți-a plăcut sau ce ar putea fi îmbunătățit..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-muted border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none h-20 mb-3 text-foreground placeholder:text-muted-foreground"
                            required
                        />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !comment.trim()}
                                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                <Send size={16} />
                                {isSubmitting ? "Se salvează..." : hasReviewed ? "Actualizează recenzia" : "Postează recenzia"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LISTA DE RECENZII EXISTENTE */}
            <div className="space-y-4 pt-2">
                {reviews.map((review) => (
                    <div key={review.id} className="py-4 border-b border-border last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {review.authorName?.substring(0, 2).toUpperCase() || "??"}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{review.authorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(review.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-primary">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={14}
                                        fill={review.stars >= star ? "currentColor" : "none"}
                                        className={review.stars >= star ? "text-primary" : "text-muted-foreground/30"}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-sm text-foreground/90 pl-[52px]">{review.body}</p>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground italic">
                            Nu există recenzii încă.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}