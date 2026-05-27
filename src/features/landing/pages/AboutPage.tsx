import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="fii-container pt-28 pb-16 max-w-4xl">
        <span className="badge mb-4">Despre noi</span>
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">FII Smart</h1>
        <p className="text-muted-foreground leading-relaxed">
          FII Smart este o platforma educationala pentru studenti si profesori. Profesorii pot crea cursuri,
          module, lectii si quiz-uri, iar studentii se pot inscrie, pot parcurge continutul si isi pot urmari progresul.
        </p>
      </main>
      <Footer />
    </div>
  );
}
