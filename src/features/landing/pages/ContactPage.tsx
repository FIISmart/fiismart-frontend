import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="fii-container pt-28 pb-16 max-w-4xl">
        <span className="badge mb-4">Contact</span>
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Contact FII Smart</h1>
        <div className="landing-card">
          <p className="text-muted-foreground mb-2">Pentru intrebari despre platforma sau conturi:</p>
          <a href="mailto:contact@fiismart.ro" className="text-primary font-semibold">contact@fiismart.ro</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
