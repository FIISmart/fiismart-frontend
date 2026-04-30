import { Bell, User, GraduationCap } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-xl cursor-pointer">
          <GraduationCap size={28} />
          <span>FiiSmart</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#" className="text-foreground border-b-2 border-primary pb-1">
            Cursurile mele
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Explorează
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Quiz-uri
          </a>
        </nav>

        <div className="flex items-center gap-4 text-muted-foreground">
          <button
            type="button"
            className="relative hover:text-foreground transition-colors"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-card" />
          </button>

          <button
            type="button"
            className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center text-foreground hover:bg-secondary/50 transition-colors"
          >
            <User size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
