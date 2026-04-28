export function loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve();

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';

        window.onYouTubeIframeAPIReady = () => resolve();

        document.body.appendChild(script);
    });
}