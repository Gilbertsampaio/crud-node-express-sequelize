import React, { useRef, useState, useEffect, useCallback } from "react";
import "./AudioMessageBubble.css";
import MicOutlined from "./icons/MicOutlined";
import HeadphonesFilled from "./icons/HeadphonesFilled";
import AudioPlayIcon from "./icons/AudioPlayIcon";
import AudioPauseIcon from "./icons/AudioPauseIcon";
import { formatarHoraMinuto } from "../../utils/helpers";

export default function AudioMessageBubble({ src, time = "14:18", tipo }) {
    const audioRef = useRef(null);
    const rafRef = useRef(null);
    const audioBarRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0..100 
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const wasPlayingRef = useRef(false);

    // RAF para atualizar a barra automaticamente
    const rafUpdate = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || isDragging) return; 

        const dur = audio.duration || duration || 0;
        if (dur > 0 && isFinite(dur)) {
            const pct = (audio.currentTime / dur) * 100;
            setProgress(pct);
            setCurrentTime(audio.currentTime);
        }

        if (!audio.paused && !audio.ended) {
            rafRef.current = requestAnimationFrame(rafUpdate);
        }
    }, [isDragging, duration]);

    // ... (togglePlay, handleSeek, useEffect, formatTime são iguais)

    const togglePlay = () => {
        // ... (lógica de togglePlay)
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            cancelAnimationFrame(rafRef.current);
            setIsPlaying(false);
            return;
        }

        const p = audio.play();
        if (p && typeof p.then === "function") {
            p.then(() => {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(rafUpdate);
                setIsPlaying(true);
            }).catch(() => {
                rafRef.current = requestAnimationFrame(rafUpdate);
                setIsPlaying(true);
            });
        } else {
            rafRef.current = requestAnimationFrame(rafUpdate);
            setIsPlaying(true);
        }
    };

    const handleSeek = (e) => {
        // ... (lógica de handleSeek)
        const rect = audioBarRef.current.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        const audio = audioRef.current;
        const dur = audio?.duration || duration || 0;
        if (!audio || !dur) return;

        audio.currentTime = percent * dur;
        setProgress(percent * 100);
        setCurrentTime(audio.currentTime);

        if (isPlaying) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(rafUpdate);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoaded = () => {
            const dur = audio.duration || 0;
            setDuration(dur);
            setCurrentTime(dur);
            setProgress(0);
        };

        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            audio.currentTime = 0;
            cancelAnimationFrame(rafRef.current);
        };

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
            cancelAnimationFrame(rafRef.current);
            // Limpa listeners globais caso o componente seja desmontado
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const formatTime = (sec) => {
        if (isNaN(sec) || sec === Infinity) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // --- Drag logic ---

    // Função central para atualizar progresso e audio em tempo real
    const updateProgress = (clientX) => {
        const bar = audioBarRef.current;
        if (!bar) return;

        const rect = bar.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        const audio = audioRef.current;
        const dur = audio?.duration || duration || 0;

        // ESTA LINHA É CRÍTICA PARA O VISUAL IMEDIATO
        // É aqui que forçamos o React a registrar a nova posição
        setProgress(percent * 100);
        setCurrentTime(percent * dur);

        if (audio && dur) {
            audio.currentTime = percent * dur;
        }
    };

    // Usamos refs para as funções de movimento/soltura para garantir que elas não causem
    // novas renderizações desnecessárias ao serem passadas como props,
    // mas ainda assim usem o estado global (document.addEventListener/removeEventListener).

    // **IMPORTANTE**: Para garantir a reatividade visual em tempo real, 
    // a função handleMouseMove NÃO deve ser encapsulada por useCallback
    // que tenha dependências pesadas, ou deve usar um throttling/raf para garantir o desempenho.
    // Como estamos usando state, vamos manter a versão mais simples, mas focando 
    // em garantir que o setProgress seja rápido.

    const handleKnobMouseDown = (e) => {
        e.stopPropagation(); 
        e.preventDefault();

        // 1. Armazena e pausa o estado de reprodução
        wasPlayingRef.current = isPlaying;
        audioRef.current?.pause(); 
        cancelAnimationFrame(rafRef.current);

        // 2. Inicia o estado de arrasto 
        setIsDragging(true);

        // 3. Adiciona listeners globais
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    // A função de movimento precisa ser rápida e leve, 
    // e chama updateProgress, que chama setProgress
    const handleMouseMove = (e) => {
        // Não checa isDragging aqui, pois a verificação principal está no handleMove/updateProgress
        if (!audioBarRef.current) return;
        updateProgress(e.clientX); 
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        
        // Retoma a reprodução SOMENTE se estava tocando antes do arrasto
        if (wasPlayingRef.current) {
            audioRef.current?.play().catch(e => console.error("Error playing audio after drag:", e));
            rafRef.current = requestAnimationFrame(rafUpdate); 
        }
    };

    // Touch support

    const handleTouchStart = (e) => {
        e.stopPropagation();
        e.preventDefault(); 

        wasPlayingRef.current = isPlaying;
        audioRef.current?.pause();
        cancelAnimationFrame(rafRef.current); 
        
        setIsDragging(true);
        updateProgress(e.touches[0].clientX); 
        // Adiciona listeners touch (apenas para dispositivos que suportam)
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleTouchEnd);
    };

    const handleTouchMove = (e) => {
        if (!audioBarRef.current) return;
        e.preventDefault();
        updateProgress(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);

        if (wasPlayingRef.current) {
            audioRef.current?.play().catch(e => console.error("Error playing audio after touch drag:", e));
            rafRef.current = requestAnimationFrame(rafUpdate); 
        }
    };
    
    // Removemos o useEffect para limpar listeners, pois o cleanup do `handleMouseUp`/`handleTouchEnd` já faz isso.

    return (
        <div className="audio-bubble">
            <div className={`audio-icon ${tipo === 'audio' ? "" : "record"}`}>
                { tipo === 'audio' ? (
                    <HeadphonesFilled size={22} color="#fff" />
                ) : (
                    <MicOutlined size={22} color="#fff" />
                )}
            </div>

            <div className="play-button" onClick={togglePlay}>
                {isPlaying ? (
                    <AudioPauseIcon size={24} color="#6f8171" />
                ) : (
                    <AudioPlayIcon size={24} color="#6f8171" />
                )}
            </div>

            <div className="audio-body">
                <div className="audio-controls">
                    <div
                        className="audio-progress-bar"
                        ref={audioBarRef}
                        onClick={handleSeek} 
                    >
                        <div
                            className="audio-progress"
                            style={{ width: `${progress}%` }} 
                        ></div>

                        <div
                            className="audio-knob"
                            style={{ left: `${progress}%` }} 
                            onMouseDown={handleKnobMouseDown}
                            // Removido onTouchMove/End pois serão adicionados globalmente no handleTouchStart
                            onTouchStart={handleTouchStart} 
                        ></div>
                    </div>
                </div>

                <div className="audio-info">
                    <span className="audio-time">{formatTime(currentTime)}</span>
                    <span className="audio-hour">{formatarHoraMinuto(time)}</span>
                </div>
            </div>

            <audio ref={audioRef} src={src} preload="metadata" />
        </div>
    );
}