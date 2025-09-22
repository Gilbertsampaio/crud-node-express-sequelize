import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import InfoRefreshed from "./icons/InfoRefreshed";
import CloseCircle from "./icons/CloseCircle";
import ClearCircleRefreshed from "./icons/ClearCircleRefreshed";
import DeleteRefreshed from "./icons/DeleteRefreshed";
import MoreRefreshed from "./icons/MoreRefreshed";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import ArchiveRefreshedIcon from "./icons/ArchiveRefreshedIcon";
import ImageModal from "./ImageModal";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
const IMAGEM_PADRAO = `${API_URL}/images/news.png`;

import "./ChatAttachment.css";

export default function ChatAttachment({
    chatId,
    dadosUsuario,
    isOpenOptions,
    onToggleOptions,
    previewDados,
    setPreviewDados,
    resetRef,
    onOptionSelect,
    chatArquivado
}) {
    const wrapperRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [userData, setUserData] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [labelArquivado, setLabelArquivado] = useState("Arquivar");
    const closeImageModal = () => setSelectedMedia(null);

    const openImageModal = (url, type) => setSelectedMedia({ url, type });

    const resetarDados = React.useCallback(() => {
        setPreviewDados(null);
        // setUserData(null);
    }, [setPreviewDados]);

    useEffect(() => {
        setLabelArquivado(chatArquivado[chatId] ? "Desarquivar" : "Arquivar")
    }, [chatArquivado, chatId]);

    useEffect(() => {
        if (resetRef) resetRef.current = resetarDados;
    }, [resetRef, resetarDados]);

    useEffect(() => {
        if (!isOpenOptions) return;

        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                onToggleOptions(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside, { passive: true });

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpenOptions, onToggleOptions]);

    const options = [
        {
            label: "Dados do contato",
            icon: InfoRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("dados"),
        },
        {
            label: "Fechar conversa",
            icon: CloseCircle,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("fechar"),
        },
        {
            label: `${labelArquivado} conversa`,
            icon: ArchiveRefreshedIcon,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("arquivar"),
        },
        {
            label: "Limpar conversa",
            icon: ClearCircleRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("limpar"),
        },
        {
            label: "Apagar conversa",
            icon: DeleteRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("apagar"),
        },
    ];

    function chamaFuncao(optionLabel) {
        setSelectedOption(optionLabel);

        switch (optionLabel) {
            case "dados":
                carregarDadosUsuario(chatId);
                break;

            case "fechar":
                if (onOptionSelect) onOptionSelect(optionLabel);
                break;

            case "arquivar":
                if (onOptionSelect) onOptionSelect(optionLabel);
                break;

            case "limpar":
                console.log("Limpar conversa");
                break;

            case "apagar":
                console.log("Apagar conversa");
                break;

            default:
                break;
        }
    }

    // Função que carrega os dados do usuário
    function carregarDadosUsuario(id) {
        // Aqui poderia vir de uma API, mas vou simular:
        const fakeUser = {
            id,
            name: dadosUsuario.name,
            email: dadosUsuario.email,
            image: dadosUsuario.image,
        };
        setUserData(fakeUser);
        setPreviewDados({ type: "text/plain" });
        onToggleOptions(false);
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
    const getAvatar = avatar => avatar ? `${API_URL}/uploads/${avatar}` : "/images/avatar.png";

    const previewModal =
        previewDados && (
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                <div
                    className={`preview-content dados`}
                >
                    <img
                        src={getAvatar(userData?.image)}
                        alt={userData.name}
                        className="img-preview"
                        style={{
                            maxWidth: "100%", marginBottom: 0, height: "70%", marginTop: "20px"
                        }}
                        onClick={() =>
                            openImageModal(getAvatar(userData?.image), "image")
                        }
                        onError={(e) => {
                            e.target.src = IMAGEM_PADRAO;
                        }}
                    />
                    <div className="container-file-preview" style={{ height: "80px" }}>
                        <div
                            style={{
                                marginBottom: 10,
                                marginTop: 10,
                                fontSize: "1.5rem",
                                color: "#aebac1",
                            }}
                        >
                            {userData ? userData.name : "Usuário não encontrado"}
                        </div>
                        <div style={{ fontSize: "1rem", color: "rgb(174, 186, 193)" }}>
                            {userData ? (
                                <>
                                    <div><b>Email:</b> {userData.email}</div>
                                </>
                            ) : (
                                "Nenhum dado disponível"
                            )}
                        </div>
                    </div>

                    <div className="preview-actions">
                        <button
                            type="button"
                            className={`options-footer options-file`}
                            onClick={() => resetarDados()}
                        >
                            <div className="icon-container">
                                <CloseRoundedIcon size={24} color="#0A0A0A" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );

    return (
        <div
            className="chat-attachment"
            ref={wrapperRef}
            style={{
                marginLeft: "auto",
                position: "relative",
                whiteSpace: "nowrap",
            }}
        >
            <button
                type="button"
                aria-expanded={isOpenOptions}
                className={`${isOpenOptions ? "active" : ""}`}
                onClick={() => onToggleOptions(!isOpenOptions)}
            >
                <MoreRefreshed />
            </button>

            <div
                className={`attachment-dropdown header ${isOpenOptions ? "open" : "closed"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {options.map((opt, index) => {
                    const Icon = opt.icon;
                    return (
                        <div
                            style={{minWidth: "210px"}}
                            key={index}
                            className="attachment-option"
                            onClick={opt.onClick || (() => onToggleOptions(false))}
                        >
                            <Icon size={26} color={opt.color} direction={chatArquivado[chatId] ? "up" : "down"}/>
                            <span
                                style={{ color: "rgba(0, 0, 0, .6)", fontSize: ".9375rem" }}
                            >
                                {opt.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {previewDados &&
                (() => {
                    const container = document.querySelector(
                        `.chat-window[data-chat-id="${chatId}"] .div-preview`
                    );
                    if (container) return createPortal(previewModal, container);
                    return null;
                })()}
            <ImageModal
                show={!!selectedMedia}
                imageUrl={selectedMedia?.url}
                type={selectedMedia?.type}
                onClose={closeImageModal}
            />
        </div>
    );
}
