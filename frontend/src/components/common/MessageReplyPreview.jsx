import React from "react";
import DocumentRefreshedThin from "./icons/DocumentRefreshedThin";
import KeyboardVoiceFilled from "./icons/KeyboardVoiceFilled";
import PollRefreshedThin from "./icons/PollRefreshedThin";
import ChatListEvent from "./icons/ChatListEvent";
import ImageRefreshed from "./icons/ImageRefreshed";
import VideoCallRefreshed from "./icons/VideoCallRefreshed";
import { formatarDataPersonalizada } from "../../utils/helpers";

const MEDIA_TYPES = [
    "image",
    "camera",
    "video",
    "file",
    "audio",
    "audioGrava",
    "enquete",
    "evento",
];

const iconByType = {
    file: DocumentRefreshedThin,
    video: VideoCallRefreshed,
    image: ImageRefreshed,
    camera: ImageRefreshed,
    audio: KeyboardVoiceFilled,
    audioGrava: KeyboardVoiceFilled,
    enquete: PollRefreshedThin,
    evento: ChatListEvent,
};

const getLabelByType = (type, currentTime = null) => {
    if (type === "video") return `${currentTime} Vídeo`;
    if (type === "file") return "Arquivo";
    if (type === "audio" || type === "audioGrava") return currentTime;
    return "Foto";
};


export default function MessageReplyPreview({ replyTo, userId, API_URL, setResponderMsg, isPreview, nomeChat }) {
    if (!replyTo) return null;

    const scrollToOriginalMessage = () => {
        const el = document.getElementById(`message-${replyTo.id}`);
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("highlight-message");

                    setTimeout(() => {
                        el.classList.remove("highlight-message");
                    }, 2000);

                    observer.disconnect();
                }
            },
            {
                root: null,          // viewport
                threshold: 0.6,      // % visível para considerar "chegou"
            }
        );

        observer.observe(el);

        el.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    const closeResposta = (idResposta) => {
        setResponderMsg(prev =>
            prev.filter(msg => msg.id !== idResposta)
        );
    };
    const isMedia = MEDIA_TYPES.includes(replyTo.type);
    const Icon = iconByType[replyTo.type];

    const iconColor =
        replyTo.type === "audio" || replyTo.type === "audioGrava"
            ? "#1DAA61"
            : "#00000099";

    return (
        <div
            className="resposta"
            key={replyTo.id}
            style={{ marginTop: (!isPreview ? 0 : 10), marginBottom: 5, borderRadius: 5, cursor: "pointer" }}
            onClick={scrollToOriginalMessage}
        >
            <div className="labelAutor" style={{ marginBottom: 4, marginRight: isMedia ? 70 : 0 }}>
                {userId !== replyTo.sender_id ? nomeChat : "Você"}
            </div>

            <div
                className="textoResposta"
                style={{
                    marginRight:
                        isMedia &&
                            ["video", "camera", "image"].includes(replyTo.type)
                            ? 70
                            : 0,
                }}
            >
                {isMedia && Icon && (
                    <span
                        aria-hidden="true"
                        data-icon={`${replyTo.type}-refreshed`}
                        style={{ display: "inherit" }}
                    >
                        <Icon size={24} color={iconColor} />
                    </span>
                )}

                {/* CONTEÚDO */}
                {replyTo.content === "[enquete]" ? (
                    <span className="mensagem-resposta">
                        {replyTo.metadata?.pergunta}
                    </span>
                ) : replyTo.content === "[evento]" ? (
                    <span className="mensagem-resposta">
                        {replyTo.metadata?.titulo} •{" "}
                        {formatarDataPersonalizada(
                            `${replyTo.metadata.dataInicio}T${replyTo.metadata.horaInicio}:00`
                        )}
                    </span>
                ) : replyTo.content !== "[uploaded file]" &&
                    replyTo.content !== "[uploaded audio]" ? (
                    <span className="mensagem-resposta">
                        {replyTo.content.length > 40
                            ? `${replyTo.content.substring(0, 40)}...`
                            : replyTo.content}
                    </span>
                ) : (
                    <span className="mensagem-resposta">
                        {getLabelByType(replyTo.type, replyTo.currentTime)}
                    </span>
                )}
            </div>

            {/* PREVIEW DE MÍDIA */}
            {isMedia && (
                <span className="box-imagem-preview-resposta" style={{ right: !isPreview ? 0 : 50 }} onClick={scrollToOriginalMessage}>
                    {replyTo.type === "video" && (
                        <video
                            src={`${API_URL}/uploads/messages/${replyTo.metadata.fileName}`}
                            className="img-preview-resposta msgR"
                            style={{ maxWidth: "100%", cursor: "zoom-in" }}
                            controls={false}
                        />
                    )}

                    {(replyTo.type === "image" || replyTo.type === "camera") && (
                        <img
                            src={`${API_URL}/uploads/messages/${replyTo.metadata.fileName}`}
                            alt="respondida"
                            className={`img-preview-resposta ${!isPreview ? "msgR" : ""}`}
                        />
                    )}
                </span>
            )}

            {isPreview && (
                <button
                    onClick={() => closeResposta(replyTo.id)}
                    type="button"
                    aria-expanded="false"
                    className="options-footer"
                >
                    <div className="icon-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            width="24"
                            viewBox="0 0 24 24"
                            fill="#0A0A0A"
                        >
                            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7a.996.996 0 1 0-1.41 1.41L10.59 12l-4.9 4.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.9c.39.39 1.02.39 1.41 0a.996.996 0 0 0 0-1.41L13.41 12l4.89-4.89c.39-.39.39-1.02 0-1.4Z" />
                        </svg>
                    </div>
                </button>
            )}
        </div>
    );
}
