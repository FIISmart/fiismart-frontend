import { UserCircle, Menu } from "lucide-react";

export function ProfDashboardNavbar() {
  return (
    <header className="w-full bg-edu-bg border-b border-edu-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-edu-foreground hover:text-edu-primary transition">
            <Menu size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold font-poppins text-edu-primary">
            FII<span className="text-edu-foreground">Smart</span>
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-edu-foreground font-medium hover:text-edu-primary transition">Cursuri</a>
          <a href="#" className="text-edu-muted-fg font-medium hover:text-edu-primary transition">Funcționalități</a>
          <a href="#" className="text-edu-muted-fg font-medium hover:text-edu-primary transition">Despre Noi</a>
          <a href="#" className="text-edu-muted-fg font-medium hover:text-edu-primary transition">Contact</a>
        </nav>

        <div className="flex items-center gap-3 border border-edu-border p-2 md:px-4 md:py-2 rounded-full cursor-pointer hover:bg-edu-bg transition">
          <UserCircle size={24} className="text-edu-muted-fg" />
          <span className="hidden md:inline text-edu-foreground font-medium">Andrei B.</span>
        </div>
      </div>
    </header>
  );
}
