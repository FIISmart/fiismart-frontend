import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Play, Pause, Eye, EyeOff } from "lucide-react";
import { loadYouTubeAPI } from "../types/loadYouTubeAPI";
import { getYouTubeId } from "../types/videoUtils";
import { lessonVideoService } from "../services/lesson-video.service";

interface YouTubePlayerType {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getPlayerState: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  destroy: () => void;
}

interface VideoMarker {
  time: number;
  id: string;
}

type Props = {
  src?: string;
  savedPosition?: number;
  studentId: string;
  courseId: string;
  lectureId: string;
  targetTime?: { time: number; id: number } | null;
  onTimeUpdate?: (time: number) => void;
  markers?: VideoMarker[];
  onMarkerClick?: (time: number, id: string) => void;
};

function formatTime(time: number): string {
  if (!Number.isFinite(time) || time < 0) return "0:00";
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
}

export default function VideoPlayer({
  src,
  savedPosition = 0,
  studentId,
  courseId,
  lectureId,
  targetTime,
  onTimeUpdate,
  markers = [],
  onMarkerClick,
}: Props) {
  const youtubeId = useMemo(() => (src ? getYouTubeId(src) : null), [src]);
  const isYouTube = Boolean(youtubeId);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YouTubePlayerType | null>(null);

  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showMarkers, setShowMarkers] = useState(true);

  const syncWithBackend = useCallback(
    async (currTime: number, dur: number) => {
      if (currTime <= 0 || dur <= 0) return;
      const watchedPercent = Math.floor((currTime / dur) * 100);
      try {
        await lessonVideoService.saveProgress(studentId, courseId, lectureId, {
          watchedPercent,
          positionSecs: Math.floor(currTime),
          completed: watchedPercent >= 95,
        });
      } catch (error) {
        console.error("Eroare la salvare progres:", error);
      }
    },
    [studentId, courseId, lectureId]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTime > 0 && duration > 0) {
        void syncWithBackend(currentTime, duration);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [currentTime, duration, syncWithBackend]);

  useEffect(() => {
    if (isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setDuration(video.duration);
      if (savedPosition > 0) video.currentTime = savedPosition;
    };

    const onTime = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const onEnd = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnd);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnd);
    };
  }, [isYouTube, onTimeUpdate, savedPosition]);

  useEffect(() => {
    if (!isYouTube || !youtubeId) return;
    let interval: number;

    loadYouTubeAPI().then(() => {
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current!, {
        videoId: youtubeId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          start: savedPosition || 0,
        },
        events: {
          onReady: (e: { target: YouTubePlayerType }) => {
            setDuration(e.target.getDuration());
          },
        },
      });

      interval = window.setInterval(() => {
        const player = ytPlayerRef.current;
        if (!player || typeof player.getCurrentTime !== "function") {
          return;
        }

        const t = player.getCurrentTime();
        setCurrentTime(t);
        onTimeUpdate?.(t);

        if (duration === 0) {
          const d = player.getDuration();
          if (d > 0) setDuration(d);
        }
      }, 500);
    });

    return () => {
      window.clearInterval(interval);
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  }, [isYouTube, youtubeId, onTimeUpdate, savedPosition, duration]);

  useEffect(() => {
    if (!targetTime) return;

    if (!isYouTube && videoRef.current) {
      videoRef.current.currentTime = targetTime.time;
      videoRef.current.play().catch(() => {});
    }

    if (isYouTube && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(targetTime.time, true);
      ytPlayerRef.current.playVideo();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPlaying(true);
  }, [targetTime, isYouTube]);

  // Imperatively update the progress bar fill width and marker positions, to
  // avoid using inline `style={{...}}` props.
  useEffect(() => {
    const fill = progressFillRef.current;
    if (fill) {
      const pct = duration ? (currentTime / duration) * 100 : 0;
      fill.style.width = `${pct}%`;
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (!duration) return;
    for (const m of markers) {
      const el = markerRefs.current[m.id];
      if (el) {
        el.style.left = `${(m.time / duration) * 100}%`;
      }
    }
  }, [markers, duration]);

  const togglePlay = (): void => {
    if (!isYouTube) {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
      return;
    }

    const player = ytPlayerRef.current;
    if (!player) return;
    const state = player.getPlayerState();

    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      player.playVideo();
      setIsPlaying(true);
    }
  };

  const seek = (time: number): void => {
    if (!isYouTube && videoRef.current) {
      videoRef.current.currentTime = time;
    }
    if (isYouTube && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(time, true);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    seek(percent * duration);
  };

  if (!src)
    return <div className="w-full aspect-video bg-black rounded-xl animate-pulse" />;

  return (
    <div className="w-full shadow-lg rounded-2xl overflow-hidden">
      <div className="relative group">
        {!isYouTube && (
          <video
            ref={videoRef}
            src={src}
            className="w-full aspect-video bg-black cursor-pointer"
            onClick={togglePlay}
          />
        )}
        {isYouTube && (
          <div ref={ytContainerRef} className="w-full aspect-video bg-black" />
        )}

        {markers.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMarkers(!showMarkers);
            }}
            className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/10 shadow-lg"
          >
            {showMarkers ? <EyeOff size={16} /> : <Eye size={16} />}
            {showMarkers ? "Ascunde adnotările" : "Arată adnotările"}
          </button>
        )}
      </div>

      <div className="bg-card p-5 border-t border-border">
        {/* PROGRESS BAR */}
        <div
          className="relative w-full h-2.5 bg-muted rounded-full cursor-pointer hover:h-3 transition-all"
          onClick={handleProgressBarClick}
        >
          <div
            ref={progressFillRef}
            className="absolute h-full w-0 bg-primary rounded-full transition-all duration-300 ease-out"
          />

          {showMarkers &&
            markers.map((m) => (
              <div
                key={m.id}
                ref={(el) => {
                  markerRefs.current[m.id] = el;
                }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-[3px] border-primary rounded-full cursor-pointer hover:scale-150 transition-transform shadow-md z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  seek(m.time);
                  onMarkerClick?.(m.time, m.id);
                }}
                title={`Sari la secunda ${formatTime(m.time)}`}
              />
            ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-5 text-foreground">
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-1" />
              )}
            </button>

            <span className="font-bold text-sm tracking-wide bg-muted px-3 py-1.5 rounded-lg border border-border">
              {formatTime(currentTime)}
              <span className="text-muted-foreground mx-2 font-normal">/</span>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
