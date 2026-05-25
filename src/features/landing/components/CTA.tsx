import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout";

export default function CTA() {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/80 z-0" />

      <div className="rounded-full blur-[48px] absolute pointer-events-none w-80 h-80 bg-primary/30 -top-20 -left-20 z-0" />
      <div className="rounded-full blur-[48px] absolute pointer-events-none w-64 h-64 bg-secondary/20 bottom-10 right-10 z-0" />
      <div className="rounded-full blur-[48px] absolute pointer-events-none w-48 h-48 bg-accent/20 top-1/2 right-1/3 z-0" />

      <PageLayout as="div" maxWidth="7xl" className="relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="w-fit mx-auto mb-6">
            <span className="bg-primary/30 text-white font-sans font-medium text-body-sm px-4 py-2 rounded-full inline-flex items-center gap-2 border border-primary/40">
              <Sparkles className="size-4" />
              Incepe Astazi Gratuit
            </span>
          </div>

          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Pregatit sa incepi calatoria ta{" "}
            <span className="text-secondary">educationala?</span>
          </h2>

          <p className="font-sans text-body-lg text-white/70 mb-10 leading-relaxed">
            Alatura-te celor peste 50,000 de studenti care invata si predau pe FIISmart.
            Acces gratuit la sute de cursuri, certificari si o comunitate extraordinara.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-foreground hover:bg-secondary hover:text-white hover:shadow-hero">
              <Link to="/auth">
                Incepe Calatoria Gratuit
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/40 text-white bg-transparent hover:bg-white/10">
              <a href="#cursuri">
                Exploreaza Cursurile
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/60 text-body-sm font-sans">
            <span>✓ Fara card bancar</span>
            <span>✓ Acces instant</span>
            <span>✓ Anuleaza oricand</span>
          </div>
        </div>
      </PageLayout>
    </section>
  );
}