export function getYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/
    );
    return match?.[1] ?? null;
}