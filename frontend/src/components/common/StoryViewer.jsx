import React, { useEffect, useState, useRef, useCallback } from "react";
import "./StoryViewer.css";
import useAuth from "../../context/useAuth";
import api from "../../api/api";
import { FaTimes } from 'react-icons/fa';
import LikeButton from "../../components/common/LikeButton";
import CommentButton from "../../components/common/CommentButton";

export default function StoryViewer({ stories = [], onClose, onMarkViewed }) {
    const [currentIndex, setCurrentIndex] = useState(() => {
        // Calcula índice inicial apenas uma vez na montagem
        const firstUnviewedIndex = stories.findIndex(s => !s.viewed);
        return firstUnviewedIndex >= 0 ? firstUnviewedIndex : 0;
    });
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const videoRef = useRef(null);
    const viewedStoriesRef = useRef(new Set());
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const { user } = useAuth();

    const currentStory = stories[currentIndex];

    const nextStory = useCallback(() => {
        clearInterval(intervalRef.current);
        setCurrentIndex(prev => {
            if (prev < stories.length - 1) return prev + 1;
            onClose();
            return prev;
        });
    }, [stories.length, onClose]);

    const prevStory = useCallback(() => {
        clearInterval(intervalRef.current);
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    }, []);

    const nextStoryOrClose = useCallback(() => {
        if (currentIndex < stories.length - 1) nextStory();
        else onClose();
    }, [currentIndex, stories.length, nextStory, onClose]);

    useEffect(() => {
        // Oculta scroll quando o story viewer abre
        document.body.style.overflow = "hidden";

        return () => {
            // Restaura scroll quando o story viewer fecha
            document.body.style.overflow = "";
        };
    }, []);

    // Marca como visto apenas o story atual, quando exibido
    useEffect(() => {
        if (!currentStory) return;
        const id = currentStory.id;

        // Marca apenas se ainda não marcou nesta sessão
        if (!viewedStoriesRef.current.has(id)) {
            viewedStoriesRef.current.add(id);

            // Só chama callback se o story não estiver marcado como visto
            if (!currentStory.viewed && typeof onMarkViewed === "function") {
                onMarkViewed(id);
            }

            if (user) {
                api.post("/stories/view", { story_id: id })
                    .catch(err => console.error("Erro ao registrar visualização:", err.response?.data || err.message));
            }
        }
    }, [currentStory, user, onMarkViewed]);

    // Controle do progresso
    useEffect(() => {
        if (!currentStory) return;

        setProgress(0);
        clearInterval(intervalRef.current);

        if (currentStory.type === "video") {
            const videoEl = videoRef.current;
            if (videoEl) {
                videoEl.currentTime = 0;
                videoEl.play().catch(() => { });

                const updateProgress = () => {
                    const duration = videoEl.duration || 5;
                    setProgress((videoEl.currentTime / duration) * 100);
                    if (videoEl.ended) nextStory();
                };

                videoEl.addEventListener("timeupdate", updateProgress);
                return () => videoEl.removeEventListener("timeupdate", updateProgress);
            }
        } else {
            const duration = 500000;
            const step = 50;
            let localProgress = 0;
            intervalRef.current = setInterval(() => {
                localProgress += (step / duration) * 100;
                setProgress(localProgress);
                if (localProgress >= 100) {
                    clearInterval(intervalRef.current);
                    nextStory();
                }
            }, step);

            return () => clearInterval(intervalRef.current);
        }
    }, [currentStory, nextStory]);

    return (
        <div className="story-viewer">
            <div className="story-header">
                <span>{currentStory?.user?.name}</span>
                <button className="storie-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            <div className="story-progress">
                {stories.map((_, idx) => (
                    <div key={idx} className="progress-bar-container">
                        <div
                            className="progress-bar-inner"
                            style={{
                                width:
                                    idx < currentIndex
                                        ? "100%"
                                        : idx === currentIndex
                                            ? `${progress}%`
                                            : "0%",
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="story-content">
                {currentStory?.type === "video" ? (
                    <video
                        ref={videoRef}
                        src={`${API_URL}/uploads/${currentStory?.media_url}`}
                        className="story-media"
                        controls={false}
                        autoPlay
                        muted
                    />
                ) : (
                    <img
                        src={`${API_URL}/uploads/${currentStory?.media_url}`}
                        alt={currentStory?.title || currentStory?.user?.name}
                        className="story-media"
                    />
                )}

                <div
                    className="clickable-area left"
                    onClick={prevStory}
                    style={{ pointerEvents: currentIndex === 0 ? "none" : "auto" }}
                />
                <div
                    className="clickable-area right"
                    onClick={nextStoryOrClose}
                />
                <LikeButton
                    modulo="storys"
                    registroId={currentStory?.id}
                />
                <CommentButton
                    modulo="storys"
                    registroId={currentStory?.id}
                />
            </div>
        </div>
    );
}
