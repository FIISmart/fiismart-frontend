import { Home, BookOpen, Users, Settings, HelpCircle } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col">
      {/* Zona de Logo */}
      <div className="p-6">
        <h2 className="text-2xl font-extrabold text-blue-600">EduConnect</h2>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Teacher Panel</span>
      </div>

      {/* Link-urile de navigare */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {/* Link Activ (Dashboard) */}
        <a href="#" className="flex items-center gap-3 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-medium transition">
          <Home size={20} />
          <span>Dashboard</span>
        </a>

        {/* Link-uri Inactive */}
        <a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition">
          <BookOpen size={20} />
          <span>Cursurile Mele</span>
        </a>

        <a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition">
          <Users size={20} />
          <span>Studenți</span>
        </a>

        <a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition">
          <HelpCircle size={20} />
          <span>Q&amp;A Video</span>
        </a>
      </nav>

      {/* Zona de jos (Setări) */}
      <div className="p-4 border-t border-gray-200">
        <a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition">
          <Settings size={20} />
          <span>Setări Cont</span>
        </a>
      </div>
    </div>
  );
}
