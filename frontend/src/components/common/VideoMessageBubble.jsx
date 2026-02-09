import React, { useRef, useState, useEffect, useCallback } from "react";

export default function VideoMessageBubble({ src, onTimeUpdate, onClick }) {
    const videoRef = useRef(null);
    const rafRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    // Atualiza progresso e envia para o pai
    const rafUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const dur = video.duration || 0;
        const pct = (video.currentTime / dur) * 100;
        setProgress(pct);
        setCurrentTime(video.currentTime);

        // Envia para o componente pai
        onTimeUpdate?.(video.currentTime);

        if (!video.paused && !video.ended) {
            rafRef.current = requestAnimationFrame(rafUpdate);
        }
    }, [onTimeUpdate]);

    useEffect(() => {
        if (onTimeUpdate) {
            onTimeUpdate(formatTime(duration));
        }
    }, [duration, onTimeUpdate]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onLoaded = () => setDuration(video.duration || 0);
        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            video.currentTime = 0;
        };

        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("ended", onEnded);

        return () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("ended", onEnded);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const formatTime = (sec) => {
        if (isNaN(sec) || sec === Infinity) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="video-bubble">
            <video
                ref={videoRef}
                src={src}
                style={{ maxWidth: "100%", borderRadius: 8, cursor: "zoom-in" }}
                onClick={onClick} // abre modal
                onError={(e) => {
                    e.currentTarget.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23eee'/></svg>";
                }}
            />

            <div className="video-info">
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
}
