
const BASE_URL = '/api/students';

export const courseService = {

    getCourseInfo: async (studentId: string, courseId: string) => {
        const response = await fetch(`${BASE_URL}/${studentId}/courses/${courseId}`);
        if (!response.ok) throw new Error("Eroare la încărcarea cursului");
        return response.json();
    },

    getModules: async (studentId: string, courseId: string) => {
        const response = await fetch(`${BASE_URL}/${studentId}/courses/${courseId}/modules`);
        if (!response.ok) throw new Error("Eroare la încărcarea modulelor");
        return response.json();
    },

    getLectureDetails: async (studentId: string, courseId: string, lectureId: string) => {
        const response = await fetch(`${BASE_URL}/${studentId}/courses/${courseId}/lectures/${lectureId}`);
        if (!response.ok) throw new Error("Eroare la încărcarea lecției");
        return response.json();
    },

    getComments: async (studentId: string, courseId: string, lectureId: string) => {
        const response = await fetch(`${BASE_URL}/${studentId}/courses/${courseId}/lectures/${lectureId}/comments`);
        if (!response.ok) throw new Error("Eroare la încărcarea comentariilor");
        return response.json();
    }
};