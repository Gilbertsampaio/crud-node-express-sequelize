import React, { useEffect, useState, useRef } from "react";
import "./AudioRecorderBubble.css";
import MicOutlined from "./icons/MicOutlined";
import DeleteRefreshed from "./icons/DeleteRefreshed";
import PauseFilled from "./icons/AudioPauseIcon";
import SendFilledIcon from "./icons/SendFilledIcon";

export default function AudioRecorderBubble({ chatId, onToggleAttachment, max }) {
    const [isShow, setIsShow] = useState(false);
    const [time, setTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const NUM_BARS = 40;
    const [waveData, setWaveData] = useState(new Array(NUM_BARS).fill(0));

    const API_URL = import.meta.env.VITE_API_URL_BACKEND || "http://localhost:3000";

    const intervalRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const resolveStopRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const audioCtxRef = useRef(null);
    const rafRef = useRef(null);

    // controla timer
    useEffect(() => {
        if (isShow && !isPaused && isRecording) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => clearInterval(intervalRef.current);
    }, [isShow, isPaused, isRecording]);

    // iniciar ou encerrar barra
    const handleControlAudio = async () => {
        if (!isShow) {
            setIsShow(true);
            setTime(0);
            setIsPaused(false);
            await startRecording();
        } else {
            stopRecording();
            setIsShow(false);
            setTime(0);
            setIsPaused(false);
        }
        console.log("chatId:", chatId);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            // 🎧 Analisador de frequência
            audioCtxRef.current = new AudioContext();
            const source = audioCtxRef.current.createMediaStreamSource(stream);
            const analyser = audioCtxRef.current.createAnalyser();
            analyser.fftSize = 64;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            source.connect(analyser);

            analyserRef.current = analyser;
            dataArrayRef.current = dataArray;

            const updateWaves = () => {
                analyser.getByteFrequencyData(dataArray);

                const step = Math.max(1, Math.floor(bufferLength / NUM_BARS));
                const values = new Array(NUM_BARS / 2).fill(0).map((_, i) => dataArray[i * step] / 255);

                // Cria um espelhamento das barras (esquerda e direita simétricas)
                const mirrored = [...values.slice().reverse(), ...values];

                setWaveData(mirrored);
                rafRef.current = requestAnimationFrame(updateWaves);
            };
            updateWaves();

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                cancelAnimationFrame(rafRef.current);
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const previewUrl = URL.createObjectURL(blob);
                const file = new File([blob], `audio_${Date.now()}.webm`, { type: "audio/webm" });
                file.previewUrl = previewUrl;
                setPreviewFile(file);
                setIsRecording(false);
                if (resolveStopRef.current) {
                    resolveStopRef.current(file);
                    resolveStopRef.current = null;
                }
                stream.getTracks().forEach((t) => t.stop());
                audioCtxRef.current.close();
            };

            recorder.start();
            setIsRecording(true);
            setTime(0);
        } catch (err) {
            console.error("Erro ao acessar microfone:", err);
        }
    };

    const handlePause = () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) return;
        if (recorder.state === "recording") {
            recorder.pause();
            setIsPaused(true);
        } else if (recorder.state === "paused") {
            recorder.resume();
            setIsPaused(false);
        }
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && (recorder.state === "recording" || recorder.state === "paused")) {
            recorder.stop();
        }
        setIsRecording(false);
    };

    const handleDelete = () => {
        stopRecording();
        cancelAnimationFrame(rafRef.current);
        chunksRef.current = [];
        setIsShow(false);
        setTime(0);
        setIsPaused(false);
        setIsRecording(false);
        setPreviewFile(null);
        setWaveData(new Array(30).fill(0));
    };

    const handleSendFile = async () => {
        const recorder = mediaRecorderRef.current;
        let fileToSend = previewFile;
        if (recorder && (recorder.state === "recording" || recorder.state === "paused")) {
            fileToSend = await new Promise((resolve) => {
                resolveStopRef.current = resolve;
                recorder.stop();
            });
        }
        if (!fileToSend) return;
        const formData = new FormData();
        formData.append("file", fileToSend);

        try {
            const res = await fetch(`${API_URL}/api/uploads/message`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            const message = {
                type: "audioGrava",
                metadata: { fileName: data.fileName, fileSize: data.fileSize },
                content: "[uploaded audio]",
            };
            onToggleAttachment(message);
        } catch (err) {
            console.error("Erro no upload:", err);
        } finally {
            handleDelete();
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="whatsapp-recorder">
            {isShow ? (
                <div className={`recorder-bar ${max}`}>
                    <button className="recorder-icon-btn delete" onClick={handleDelete}>
                        <DeleteRefreshed size={24} />
                    </button>
                    <div className={`record-dot ${isPaused ? "paused" : ""}`} />
                    <span className="record-time">{formatTime(time)}</span>

                    <div className={`record-wave ${isPaused ? "paused" : ""} ${max}`}>
                        {waveData.map((v, i) => (
                            <div
                                key={i}
                                className="wave-bar"
                                style={{
                                    ...(isPaused ? { height: 10 } : { height: `${10 + v * 30}px` }),
                                    ...(isPaused ? {} : { animationDelay: `${(i % 7) * 0.05}s` }),
                                }}
                            />
                        ))}
                    </div>

                    <button className="recorder-icon-btn pause" onClick={handlePause}>
                        {isPaused ? <MicOutlined size={24} /> : <PauseFilled size={24} />}
                    </button>

                    <div className="options-footer options-send" onClick={handleSendFile}>
                        <SendFilledIcon size={24} color="#fff" />
                    </div>
                </div>
            ) : (
                <span className="options-footer options-audio" onClick={handleControlAudio}>
                    <MicOutlined size={24} />
                </span>
            )}
        </div>
    );
}
