import { Play, Volume2, Settings, Maximize } from 'lucide-react';

export default function VideoPlayer() {
    return (
        <div className="relative group bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">

            {/* Imaginea de fundal (Thumbnail) */}
            <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                alt="Thumbnail"
                className="w-full h-full object-cover opacity-60"
            />

            {/* Butonul Mare de Play - Acum e centrat absolut peste imagine */}
            <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/90 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110">
                <Play size={32} fill="currentColor" />
            </button>

            {/* Controalele de jos (Bara de progres, Volum, Setări) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-12">

                {/* Bara de progres */}
                <div className="w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer">
                    <div className="w-1/3 h-full bg-primary rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
                    </div>
                </div>

                {/* Butoanele mici de jos */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <Play size={20} fill="currentColor" className="cursor-pointer" />
                        <Volume2 size={20} className="cursor-pointer" />
                        <span className="text-sm font-medium">04:12 / 12:30</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Settings size={20} className="cursor-pointer" />
                        <Maximize size={20} className="cursor-pointer" />
                    </div>
                </div>
            </div>

        </div>
    );
}