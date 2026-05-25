import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Alexandru Popa",
    role: "Dezvoltator Web",
    content:
      "FIISmart mi-a schimbat complet traiectoria profesionala. Am invatat React si TypeScript de la zero si acum lucrez la o firma de top din Cluj. Cursurile sunt extrem de bine structurate si profesorii sunt mereu disponibili.",
    rating: 5,
    initials: "AP",
    color: "from-primary/20 to-secondary/30",
  },
  {
    id: 2,
    name: "Alexandra Ionescu",
    role: "Designer UI/UX",
    content:
      "Ca designer, am gasit exact ce aveam nevoie. Cursul de Figma si principiile de UX m-au ajutat sa obtin primul meu job remote. Recomand cu caldura oricui vrea sa intre in design.",
    rating: 5,
    initials: "AI",
    color: "from-accent/30 to-primary/20",
  },
  {
    id: 3,
    name: "Victor Stanescu",
    role: "Antreprenor",
    content:
      "Platforma este excelente pentru business. Am urmat cursuri de marketing digital si management si am aplicat imediat ce am invatat in afacerea mea. ROI-ul a fost vizibil din prima luna.",
    rating: 5,
    initials: "VS",
    color: "from-secondary/20 to-accent/30",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-20 bg-muted/30">
      <PageLayout as="div" maxWidth="7xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm font-medium gap-1.5 bg-accent/40 border-0 mb-4">
            💬 Testimoniale
          </Badge>
          <h2 className="font-serif text-h2 font-bold text-foreground mb-4">
            Ce spun utilizatorii nostri
          </h2>
          <p className="font-sans text-body-lg text-muted-foreground max-w-xl mx-auto">
            Sute de studenti si profesori ne-au acordat increderea lor. Iata ce spun ei.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 gap-4 relative overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
              <Quote
                className="size-8 absolute top-4 right-4 text-primary/10"
                fill="currentColor"
              />

              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="font-sans text-body text-muted-foreground leading-relaxed relative z-10">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-border mt-auto">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center font-serif font-semibold text-foreground text-body-sm flex-shrink-0`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-serif font-semibold text-foreground text-body-sm">
                    {testimonial.name}
                  </p>
                  <p className="font-sans text-caption text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageLayout>
    </section>
  );
}