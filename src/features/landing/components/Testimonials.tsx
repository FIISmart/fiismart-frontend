import { Star, Quote } from "lucide-react";

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
      "Platforma este excelenta pentru business. Am urmat cursuri de marketing digital si management si am aplicat imediat ce am invatat in afacerea mea. ROI-ul a fost vizibil din prima luna.",
    rating: 5,
    initials: "VS",
    color: "from-secondary/20 to-accent/30",
  },
];

export default function Testimonials() {
  return (
    <section className="landing-section-padding bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="landing-badge mb-4">💬 Testimoniale</span>
          <h2 className="font-heading landing-text-h2 font-bold text-foreground mb-4">
            Ce spun utilizatorii nostri
          </h2>
          <p className="font-body landing-text-body-lg text-muted-foreground max-w-xl mx-auto">
            Sute de studenti si profesori ne-au acordat increderea lor. Iata ce spun ei.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="landing-card flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Quote Icon */}
              <Quote
                size={40}
                className="absolute top-4 right-4 text-primary/10"
                fill="currentColor"
              />

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="font-body landing-text-body text-muted-foreground leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border mt-auto">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center font-heading font-semibold text-foreground landing-text-body-sm flex-shrink-0`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground landing-text-body-sm">
                    {testimonial.name}
                  </p>
                  <p className="font-body landing-text-caption text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
