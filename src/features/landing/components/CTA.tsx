import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="landing-section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/80 z-0" />

      {/* Decorative blobs */}
      <div className="landing-blob w-80 h-80 bg-primary/30 -top-20 -left-20 z-0" />
      <div className="landing-blob w-64 h-64 bg-secondary/20 bottom-10 right-10 z-0" />
      <div className="landing-blob w-48 h-48 bg-accent/20 top-1/2 right-1/3 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="w-fit mx-auto mb-6">
            <span className="bg-primary/30 text-white font-body font-medium landing-text-body-sm px-4 py-2 rounded-full inline-flex items-center gap-2 border border-primary/40">
              <Sparkles size={14} />
              Incepe Astazi Gratuit
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Pregatit sa incepi calatoria ta{" "}
            <span className="text-secondary">educationala?</span>
          </h2>

          {/* Description */}
          <p className="font-body landing-text-body-lg text-white/70 mb-10 leading-relaxed">
            Alatura-te celor peste 50,000 de studenti care invata si predau pe FIISmart.
            Acces gratuit la sute de cursuri, certificari si o comunitate extraordinara.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth"
              className="bg-white text-foreground font-body font-medium text-base py-4 px-8 rounded-md transition-all duration-300 hover:bg-secondary hover:text-white landing-shadow-hero inline-flex items-center gap-2"
            >
              Incepe Calatoria Gratuit
              <ArrowRight size={18} />
            </Link>
            <a
              href="#cursuri"
              className="bg-transparent border border-white/40 text-white font-body font-medium text-base py-4 px-8 rounded-md transition-all duration-300 hover:bg-white/10 inline-flex items-center gap-2"
            >
              Exploreaza Cursurile
            </a>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/60 landing-text-body-sm font-body">
            <span>✓ Fara card bancar</span>
            <span>✓ Acces instant</span>
            <span>✓ Anuleaza oricand</span>
          </div>
        </div>
      </div>
    </section>
  );
}
