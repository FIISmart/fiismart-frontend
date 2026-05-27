import { ArrowRight, BookOpen, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-background">
      <div className="blob w-96 h-96 bg-secondary/30 top-10 -left-20 z-0" />
      <div className="blob w-80 h-80 bg-accent/40 bottom-10 right-10 z-0" />
      <div className="blob w-64 h-64 bg-primary/20 top-1/2 left-1/3 z-0" />

      <div className="fii-container relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
          <div className="flex flex-col gap-6 animate-fadeInUp">
            <div className="w-fit">
              <span className="badge">Platforma educationala pentru studenti si profesori</span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Invata. Preda.
              </h1>
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-primary leading-tight">
                Conecteaza-te.
              </h1>
            </div>

            <p className="font-body text-body-lg text-muted-foreground max-w-md leading-relaxed">
              FII Smart conecteaza studentii cu profesori, cursuri publicate,
              progres de invatare si quiz-uri intr-un flow coerent.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/auth" className="btn-primary">
                Incepe Gratuit
              </Link>
              <Link to="/courses" className="btn-secondary">
                <Search size={16} />
                Exploreaza cursuri
              </Link>
            </div>

            <div className="flex items-center gap-2 pt-4 text-body-sm text-muted-foreground font-body">
              <Users size={18} className="text-primary" />
              <span>Lectii clare, mentori disponibili si progres urmarit pas cu pas.</span>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative animate-float">
              <div className="bg-card rounded-xl shadow-hero p-4 w-full max-w-sm border border-border">
                <div className="relative bg-gradient-to-br from-secondary/30 to-primary/20 rounded-lg h-48 flex items-center justify-center mb-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20" />
                  <Link
                    to="/courses"
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-card-hover hover:scale-110 transition-transform duration-300 z-10"
                    aria-label="Exploreaza cursurile"
                  >
                    <ArrowRight size={24} className="text-white" />
                  </Link>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="bg-primary text-white text-caption font-medium px-3 py-1 rounded-full">Cursuri</span>
                  <span className="text-muted-foreground text-caption px-3 py-1">Tutori</span>
                </div>

                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Descopera cursurile publicate
                </h3>
                <p className="text-body-sm text-muted-foreground mb-3">
                  Alege un curs potrivit si continua invatarea in ritmul tau.
                </p>

                <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                  <Users size={14} />
                  <span>Inscriere, progres si quiz-uri</span>
                </div>

                <Link to="/courses" className="w-full btn-primary mt-4 justify-center py-3">
                  Vezi cursurile
                </Link>
              </div>

              <div className="absolute -top-4 -left-4 bg-card rounded-lg p-3 shadow-card border border-border flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/40 rounded-md flex items-center justify-center">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Cursuri Active</p>
                  <p className="text-body-sm font-semibold text-foreground font-heading">Interactive</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-card rounded-lg p-3 shadow-card border border-border flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary/30 rounded-md flex items-center justify-center">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Tutori</p>
                  <p className="text-body-sm font-semibold text-foreground font-heading">Reali</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
