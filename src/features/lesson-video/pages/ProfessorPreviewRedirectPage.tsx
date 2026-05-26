import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getModules } from "@/lib/api.ts";
import { Spinner } from "@/components/ui/spinner.tsx";

export default function ProfessorPreviewRedirectPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!courseId) return;

        getModules(courseId).then((modules) => {
            const firstLecture = modules[0]?.lectures[0];
            if (firstLecture?.id) {
                navigate(
                    `/professor/preview/${courseId}/lectures/${firstLecture.id}`,
                    { replace: true }
                );
            } else {
                // Cursul nu are lecții — întoarce profesorul la lista de cursuri
                navigate("/professor/courses", { replace: true });
            }
        }).catch(() => {
            navigate("/professor/courses", { replace: true });
        });
    }, [courseId, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4EFE8]">
            <Spinner className="size-8 text-[#9b8ec7]" />
        </div>
    );
}