import { Globe, Lightbulb, Heart, Shield } from 'lucide-react';

interface AboutFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: AboutFeature[] = [
  {
    icon: <Globe size={20} />,
    title: 'Misiunea noastra',
    description: 'Sa facem educatia de calitate accesibila pentru oricine din Romania.',
    color: 'bg-accent/40 text-primary',
  },
  {
    icon: <Lightbulb size={20} />,
    title: 'Inovatie pentru invatare',
    description: 'Folosim AI si tehnologie moderna pentru a personaliza experienta de invatare.',
    color: 'bg-secondary/30 text-primary',
  },
  {
    icon: <Heart size={20} />,
    title: 'Comunitate',
    description: 'O comunitate activa de studenti si profesori care se sustin reciproc.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: <Shield size={20} />,
    title: 'Calitate garantata',
    description: 'Toate cursurile sunt verificate si aprobate de expertii nostri.',
    color: 'bg-accent/40 text-primary',
  },
];

const About = () => {
  return (
    <section id="comunitate" className="section-padding bg-background">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div>
            <span className="badge-purple mb-4">💡 Despre noi</span>
            <h2 className="font-heading text-h2 font-bold text-foreground mb-6">
              Construim viitorul <br />
              educatiei impreuna
            </h2>
            <p className="font-body text-body-lg text-muted-foreground mb-6 leading-relaxed">
              FIISmart este mai mult decat o platforma de cursuri online. Suntem o
              comunitate de invatare dedicata sa transforme felul in care oamenii
              acumuleaza cunostinte si abilitati in Romania.
            </p>
            <p className="font-body text-body text-muted-foreground mb-8 leading-relaxed">
              Fondati in 2026, ne-am propus sa cream cel mai complet ecosistem
              educational digital din Romania, conectand studenti talentati cu
              profesori experti intr-un mediu modern si accesibil.
            </p>

            {/* Stats Row */}
            <div className="flex gap-8 mb-8">
              {[
                { value: '15+', label: 'Ani experienta' },
                { value: '2026', label: 'An fondare' },
                { value: 'RO', label: 'Bazati in Romania' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-heading text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="font-body text-body-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <a href="#" className="btn-primary w-fit">
              Afla mai mult
            </a>
          </div>

          {/* Right - Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:border-primary/30 transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="font-body text-body-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
