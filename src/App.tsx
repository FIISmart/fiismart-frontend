import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
      <div className="min-h-screen bg-edu-bg text-edu-foreground flex flex-col font-sans">
        {/* Bara de navigare stă sus pe toate paginile */}
        <Navbar />

        {/* Aici încărcăm pagina de Dashboard conectată la backend */}
        <Dashboard />
      </div>
  );
}

export default App;