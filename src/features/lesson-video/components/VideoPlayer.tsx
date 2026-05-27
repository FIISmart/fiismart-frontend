import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Play, Pause, Eye, EyeOff, MessageSquare, Clock } from "lucide-react";
import { loadYouTubeAPI } from "../types/loadYouTubeAPI";
import { getYouTubeId } from "../types/videoUtils";
import { lessonVideoService } from "../services/lesson-video.service";
import type { CourseComment, GroupedVideoMarker } from "../types";

interface YouTubePlayerType {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getPlayerState: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  destroy: () => void;
}

type Props = {
  src?: string;
  savedPosition?: number;
  studentId: string;
  courseId: string;
  lectureId: string;
  targetTime?: { time: number; id: number } | null;
  onTimeUpdate?: (time: number) => void;
  markers?: GroupedVideoMarker[];
  onMarkerClick?: (time: number, id: string) => void;
  onProgressSaved?: (response?: {
    lectureId: string;
    watchedPercent: number;
    positionSecs: number;
    completed: boolean;
    overallProgress: number;
  }) => void;
  onDurationDetected?: (durationSecs: number) => void;
  previewMode?: boolean;
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
                                      onProgressSaved,
                                      onDurationDetected,
                                      previewMode = false,
                                    }: Props) {
  const youtubeId = useMemo(() => (src ? getYouTubeId(src) : null), [src]);
  const isYouTube = Boolean(youtubeId);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YouTubePlayerType | null>(null);

  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMarkers, setShowMarkers] = useState(true);

  // Starea pentru marker-ul curent (hovered)
  const [hoveredMarker, setHoveredMarker] = useState<GroupedVideoMarker | null>(null);

  const timeRef = useRef(0);
  const durationRef = useRef(0);
  const reportedDurationRef = useRef(0);

  useEffect(() => {
    timeRef.current = currentTime;
    durationRef.current = duration;
  }, [currentTime, duration]);

  const reportDuration = useCallback((value: number) => {
    if (!Number.isFinite(value) || value <= 0) return;
    const rounded = Math.round(value);
    setDuration(value);
    if (Math.abs(reportedDurationRef.current - rounded) > 1) {
      reportedDurationRef.current = rounded;
      onDurationDetected?.(rounded);
    }
  }, [onDurationDetected]);

  const syncWithBackend = useCallback(
      async (currTime: number, dur: number) => {
        if (previewMode) return;
        if (!lectureId || lectureId === "undefined") return;
        if (currTime <= 0 || dur <= 0) return;
        const watchedPercent = Math.floor((currTime / dur) * 100);
        try {
          const response = await lessonVideoService.saveProgress(studentId, courseId, lectureId, {
            watchedPercent,
            positionSecs: Math.floor(currTime),
            completed: watchedPercent >= 95,
            durationSecs: Math.round(dur),
          });

          onProgressSaved?.(response);
        } catch (error) {
          console.error("Eroare la salvare progres:", error);
        }
      },
      [studentId, courseId, lectureId, onProgressSaved, previewMode]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const curr = timeRef.current;
      const dur = durationRef.current;
      if (curr > 0 && dur > 0) {
        void syncWithBackend(curr, dur);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  useEffect(() => {
    if (isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      reportDuration(video.duration);
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
  }, [isYouTube, onTimeUpdate, reportDuration, savedPosition]);

  useEffect(() => {
    if (!isYouTube || !youtubeId) return;
    let interval: number;
    let isCancelled = false;

    loadYouTubeAPI().then(() => {
      if (isCancelled) return;
      if (!ytContainerRef.current) return;

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: youtubeId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          start: savedPosition || 0,
        },
        events: {
          onReady: (e: { target: YouTubePlayerType }) => {
            if (isCancelled) return;
            const d = e.target.getDuration();
            reportDuration(d);
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            } else if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          }
        },
      });

      interval = window.setInterval(() => {
        if (isCancelled) return;
        const player = ytPlayerRef.current;
        if (!player || typeof player.getCurrentTime !== "function") return;

        const t = player.getCurrentTime();
        setCurrentTime(t);
        onTimeUpdate?.(t);

        if (reportedDurationRef.current === 0) {
          const d = player.getDuration();
          if (d > 0) reportDuration(d);
        }
      }, 500);
    });

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YT player", e);
        }
        ytPlayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYouTube, youtubeId, savedPosition]);

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

    setIsPlaying(true);
  }, [targetTime, isYouTube]);

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
      const el = markerRefs.current[m.time];
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
              className="relative w-full h-2.5 bg-muted rounded-full cursor-pointer hover:h-3 transition-all group/timeline"
              onClick={handleProgressBarClick}
          >
            <div
                ref={progressFillRef}
                className="absolute h-full w-0 bg-primary rounded-full transition-all duration-300 ease-out"
            />

            {showMarkers &&
                markers.map((m) => {
                  const hasProfessor = m.comments.some((c) => c.authorRole === "Profesor");

                  return (
                      <div
                          key={m.time}
                          ref={(el) => {
                            markerRefs.current[m.time] = el;
                          }}
                          onMouseEnter={() => setHoveredMarker(m)}
                          onMouseLeave={() => setHoveredMarker(null)}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 group/marker"
                          onClick={(e) => {
                            e.stopPropagation();
                            seek(m.time);
                            if (m.comments[0]) {
                              onMarkerClick?.(m.time, m.comments[0].commentId);
                            }
                          }}
                      >
                        {/* Punctul vizual de pe timeline */}
                        <div
                            className={`rounded-full cursor-pointer transition-all duration-150 border-2 border-white shadow-md hover:scale-150 ${
                                hasProfessor
                                    ? "bg-primary w-5 h-5 sm:w-4 sm:h-4 animate-pulse relative z-30"
                                    : m.count > 2
                                        ? "bg-secondary w-4 h-4 sm:w-3.5 sm:h-3.5"
                                        : "bg-neutral-400 w-4 h-4 sm:w-3 sm:h-3"
                            }`}
                        />

                        {/* Tooltip-ul care apare la hover */}
                        {hoveredMarker?.time === m.time && (
                            <div
                                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl w-[280px] sm:w-64 max-w-[90vw] pointer-events-auto animate-in fade-in slide-in-from-bottom-1 duration-150 z-50"
                                onMouseEnter={() => setHoveredMarker(m)}
                                onMouseLeave={() => setHoveredMarker(null)}
                            >
                              {/* HEADER TOOLTIP */}
                              <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-2 font-bold text-foreground">
                        <span className="flex items-center gap-1 text-xs">
                          <MessageSquare size={12} className="text-primary" />
                          {m.count} {m.count === 1 ? "discuție" : "discuții"}
                        </span>
                                <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <Clock size={10} /> {formatTime(m.time)}
                        </span>
                              </div>

                              {/* ZONA DE SCROLL CU COMENTARII */}
                              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                                {m.comments.map((comment, cIndex) => (
                                    <div key={comment.commentId || cIndex} className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                              <span
                                  className={`font-bold text-[11px] truncate max-w-[140px] ${
                                      comment.authorRole === "Profesor"
                                          ? "text-primary"
                                          : "text-foreground"
                                  }`}
                              >
                                {comment.authorName}
                              </span>
                                        {comment.authorRole === "Profesor" && (
                                            <span className="text-[8px] bg-primary text-white px-1 rounded font-bold uppercase tracking-wide">
                                  PROF
                                </span>
                                        )}
                                      </div>
                                      <p className="line-clamp-2 text-muted-foreground text-[11px] leading-relaxed">
                                        {comment.body}
                                      </p>
                                    </div>
                                ))}
                              </div>
                            </div>
                        )}
                      </div>
                  );
                })}
          </div>

          {/* CONTROLS */}
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
