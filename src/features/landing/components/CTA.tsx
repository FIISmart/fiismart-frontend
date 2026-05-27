import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/80 z-0" />
      <div className="blob w-80 h-80 bg-primary/30 -top-20 -left-20 z-0" />
      <div className="blob w-64 h-64 bg-secondary/20 bottom-10 right-10 z-0" />
      <div className="blob w-48 h-48 bg-accent/20 top-1/2 right-1/3 z-0" />

      <div className="fii-container relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="w-fit mx-auto mb-6">
            <span className="bg-primary/30 text-white font-body font-medium text-body-sm px-4 py-2 rounded-full inline-flex items-center gap-2 border border-primary/40">
              <Sparkles size={14} />
              Creeaza un cont gratuit
            </span>
          </div>

          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Pregatit sa incepi calatoria ta{" "}
            <span className="text-secondary">educationala?</span>
          </h2>

          <p className="font-body text-body-lg text-white/70 mb-10 leading-relaxed">
            Alege rolul potrivit, inscrie-te la cursuri sau publica propriul continut educational.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth"
              className="bg-white text-foreground font-body font-medium text-base py-4 px-8 rounded-md transition-all duration-300 hover:bg-secondary hover:text-white hover:shadow-hero inline-flex items-center gap-2"
            >
              Incepe Gratuit
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/courses"
              className="bg-transparent border border-white/40 text-white font-body font-medium text-base py-4 px-8 rounded-md transition-all duration-300 hover:bg-white/10 inline-flex items-center gap-2"
            >
              Exploreaza Cursurile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
