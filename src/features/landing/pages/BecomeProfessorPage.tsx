import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BecomeProfessorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="fii-container pt-28 pb-16 max-w-4xl">
        <span className="badge mb-4">Pentru profesori</span>
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Devino profesor pe FII Smart</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Creeaza un cont, alege rolul PROFESSOR si poti publica propriile cursuri, lectii si quiz-uri.
        </p>
        <Link to="/auth" className="btn-primary inline-flex">Creeaza cont de profesor</Link>
      </main>
      <Footer />
    </div>
  );
}
