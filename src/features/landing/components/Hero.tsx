import { Play, Users, BookOpen, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-background">
      {/* Decorative blobs */}
      <div className="blob w-96 h-96 bg-secondary/30 top-10 -left-20 z-0" />
      <div className="blob w-80 h-80 bg-accent/40 bottom-10 right-10 z-0" />
      <div className="blob w-64 h-64 bg-primary/20 top-1/2 left-1/3 z-0" />

      <div className="fii-container relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
          {/* Left Content */}
          <div className="flex flex-col gap-6 animate-fadeInUp">
            {/* Badge */}
            <div className="w-fit">
              <span className="badge">
                🎓 Platforma Nr.1 in Educatie
              </span>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Invata. Preda.
              </h1>
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-primary leading-tight">
                Conecteaza-te.
              </h1>
            </div>

            {/* Description */}
            <p className="font-body text-body-lg text-muted-foreground max-w-md leading-relaxed">
              Platforma educationala completa pentru profesori si studenti.
              Conecteaza-te, invata si preda in cea mai moderna platforma de tutoring
              din Romania.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/auth" className="btn-primary">
                Incepe Gratuit
              </Link>
              <a href="#cursuri" className="btn-secondary">
                <Play size={16} />
                Exploreaza cursuri
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-body-sm text-muted-foreground font-body">
                  <span className="font-medium text-foreground">50K+</span> studenti activi
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="star-filled fill-amber-400 text-amber-400" />
                ))}
                <span className="text-body-sm text-muted-foreground ml-1">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right Content - Video/Card */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Main Card */}
            <div className="relative animate-float">
              <div className="bg-card rounded-xl shadow-hero p-4 w-full max-w-sm border border-border">
                {/* Video Preview */}
                <div className="relative bg-gradient-to-br from-secondary/30 to-primary/20 rounded-lg h-48 flex items-center justify-center mb-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20" />
                  <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-card-hover hover:scale-110 transition-transform duration-300 z-10">
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </button>
                  {/* Decorative dots */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                    <div className="w-2 h-2 rounded-full bg-secondary/60" />
                    <div className="w-2 h-2 rounded-full bg-accent/60" />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                  <span className="bg-primary text-white text-caption font-medium px-3 py-1 rounded-full">Preview</span>
                  <span className="text-muted-foreground text-caption px-3 py-1">Inscriere</span>
                </div>

                {/* Course Info */}
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  JavaScript Avansat
                </h3>
                <p className="text-body-sm text-muted-foreground mb-3">
                  Invata sa construiesti aplicatii web performante
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                    <Users size={14} />
                    <span>1,234 studenti</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="star-filled fill-amber-400 text-amber-400" />
                    <span className="text-body-sm font-medium text-foreground">4.8</span>
                  </div>
                </div>

                {/* Enroll button */}
                <button className="w-full btn-primary mt-4 justify-center py-3">
                  Inscrie-te Gratuit
                </button>
              </div>

              {/* Floating Badge - Top Left */}
              <div className="absolute -top-4 -left-4 bg-card rounded-lg p-3 shadow-card border border-border flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/40 rounded-md flex items-center justify-center">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Cursuri Active</p>
                  <p className="text-body-sm font-semibold text-foreground font-heading">1,200+</p>
                </div>
              </div>

              {/* Floating Badge - Bottom Right */}
              <div className="absolute -top-4 -right-4 bg-card rounded-lg p-3 shadow-card border border-border flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary/30 rounded-md flex items-center justify-center">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Profesori Verificati</p>
                  <p className="text-body-sm font-semibold text-foreground font-heading">500+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
