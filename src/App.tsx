import { Routes, Route } from "react-router-dom";
import CourseBuilderPage from "./pages/CourseBuilderPage";
import CoursesListPage from "./pages/CoursesListPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CourseBuilderPage />} />
      <Route path="/cursuri" element={<CoursesListPage />} />
    </Routes>
  );
}
