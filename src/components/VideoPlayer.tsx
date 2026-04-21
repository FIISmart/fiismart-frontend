export default function VideoPlayer() {
    // video de test
    const sampleVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
    const sampleThumbnailUrl = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80";

    return (
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <video
                className="w-full h-full object-cover outline-none"
                controls
                poster={sampleThumbnailUrl}
            >
                <source src={sampleVideoUrl} type="video/mp4" />
                Browser-ul tău nu suportă redarea acestui videoclip.
            </video>

        </div>
    );
}