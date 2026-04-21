
import { Star, Users } from 'lucide-react';
import type { CourseHeader } from '../types';

interface CourseInfoProps {
    courseData: CourseHeader;
}

export default function CourseInfo({ courseData }: CourseInfoProps) {
    const teacherName = courseData?.teacher?.displayName || 'Profesor';

    const teacherInitials = courseData?.teacher?.displayName
        ? courseData.teacher.displayName.substring(0, 2).toUpperCase()
        : 'PR';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                    {courseData?.title || 'Titlu curs indisponibil'}
                </h1>
            </div>

            <div className="flex flex-wrap items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">

                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {teacherInitials}
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{teacherName}</p>
                        <p className="text-sm text-muted-foreground">Instructor</p>
                    </div>
                </div>

                <div className="flex gap-6 mt-4 sm:mt-0">
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-primary" />
                        <span className="text-sm font-medium">Studenți înscriși</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star size={18} className="text-primary fill-primary" />
                        <span className="text-sm font-medium">Curs Nou</span>
                    </div>
                </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
                {courseData?.description || 'Nu există o descriere disponibilă pentru acest curs.'}
            </p>
        </div>
    );
}