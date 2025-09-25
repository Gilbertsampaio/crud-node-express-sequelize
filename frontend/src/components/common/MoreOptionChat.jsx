import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import InfoRefreshed from "./icons/InfoRefreshed";
import CloseCircle from "./icons/CloseCircle";
import UnDeleteRefreshed from "./icons/UnDeleteRefreshed";
import DeleteRefreshed from "./icons/DeleteRefreshed";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import ArchiveRefreshedIcon from "./icons/ArchiveRefreshedIcon";
import BlockRefreshedIcon from "./icons/BlockRefreshedIcon";
import PinRefreshedIcon from "./icons/PinRefreshedIcon";
import UnpinRefreshedIcon from "./icons/UnpinRefreshedIcon";
import MoreRefreshed from "./icons/MoreRefreshed";
import ArrowDropIcon from "./icons/ArrowDropIcon";
import { FaTrashRestoreAlt } from "react-icons/fa";

const icons = {
    MoreRefreshed,
    ArrowDropIcon,
};

import ImageModal from "./ImageModal";
import ConfirmModal from "./ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
const IMAGEM_PADRAO = `${API_URL}/images/news.png`;

import "./ChatAttachment.css";

export default function ChatAttachment({
    iconBotao,
    chatName,
    chatId,
    dadosUsuario,
    isOpenOptions,
    onToggleOptions,
    previewDados,
    setPreviewDados,
    resetRef,
    onOptionSelect,
    chatArquivado,
    chatFixado,
    chatBloqueado,
    chatLimpo,
    fecharConversa
}) {
    const wrapperRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [userData, setUserData] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [labelArquivado, setLabelArquivado] = useState("Arquivar");
    const [labelFixado, setLabelFixado] = useState("Fixar");
    const [labelBloqueado, setLabelBloqueado] = useState("Bloquear");
    // const [labelLimpo, setLabelLimpo] = useState("Limpar");
    const [labelApagado, setLabelApagado] = useState("Apagar conversas");
    const [showModal, setShowModal] = useState(false);
    const [tituloConfirma, setTituloConfirma] = useState(null);
    const [msgConfirma, setMsgConfirma] = useState(null);
    // const [openDirection, setOpenDirection] = useState("down");

    const [isVisible, setIsVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    const IconB = icons[iconBotao];


    const closeImageModal = () => setSelectedMedia(null);
    const openImageModal = (url, type) => setSelectedMedia({ url, type });

    const [dropStyle, setDropStyle] = useState({});
    const [dropDirection, setDropDirection] = useState("down");

    useEffect(() => {
        if (!isOpenOptions) {
            const options = wrapperRef.current.querySelectorAll('.attachment-option');
            options.forEach(opt => {
                opt.style.opacity = 0;
                opt.style.transform = 'translateY(6px) scale(0.85)';
            });
        }
    }, [isOpenOptions]);

    useEffect(() => {
        if (isOpenOptions) {
            setIsVisible(true);   // mostra o dropdown no DOM
            setClosing(false);    // garante que não está fechando

            // aqui você define dropStyle inicial + transição aberta
            const buttonRect = wrapperRef.current.getBoundingClientRect();
            const dropdownHeight = 250;
            const spaceBottom = window.innerHeight - buttonRect.bottom;
            const spaceTop = buttonRect.top;

            let top = buttonRect.bottom + 8;
            let direction = "down";

            if (spaceBottom < dropdownHeight && spaceTop > spaceBottom) {
                top = buttonRect.top - dropdownHeight - 8;
                direction = "up";
            }

            const translateY = direction === "down" ? 6 : -6;

            setDropStyle({
                position: "fixed",
                top: top,
                right: window.innerWidth - buttonRect.right + 10,
                minWidth: "210px",
                zIndex: 1001,
                transform: `scale(0.85) translateY(${translateY}px)`,
                opacity: 0,
                transformOrigin: direction === "down" ? "top right" : "bottom right",
                pointerEvents: "none",
            });

            setTimeout(() => {
                setDropStyle(prev => ({
                    ...prev,
                    transform: "scale(1) translateY(0)",
                    opacity: 1,
                    pointerEvents: "auto",
                    transition: "transform 220ms cubic-bezier(.2,.9,.2,1), opacity 180ms ease",
                }));
            }, 20);

            setDropDirection(direction);

        } else if (isVisible) {
            // Ao fechar: aplica animação de fechamento
            setClosing(true);

            setDropStyle(prev => ({
                ...prev,
                transform: dropDirection === "down" ? "scale(0.85) translateY(6px)" : "scale(0.85) translateY(-6px)",
                opacity: 0,
                pointerEvents: "none",
                transition: "transform 180ms cubic-bezier(.2,.9,.2,1), opacity 150ms ease",
            }));

            // Remove do DOM depois da animação (ex: 180ms)
            const timer = setTimeout(() => {
                setIsVisible(false);
                setClosing(false);
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [isOpenOptions, dropDirection, isVisible]);

    const resetarDados = React.useCallback(() => {
        setPreviewDados(null);
        // setUserData(null);
    }, [setPreviewDados]);

    // useEffect(() => {
    //     if (isOpenOptions && wrapperRef.current) {
    //         const rect = wrapperRef.current.getBoundingClientRect();
    //         const spaceBottom = window.innerHeight - rect.bottom;
    //         const spaceTop = rect.top;

    //         if (spaceBottom < 250 && spaceTop > spaceBottom) {
    //             setOpenDirection("up");
    //         } else {
    //             setOpenDirection("down");
    //         }
    //     }
    // }, [isOpenOptions]);

    useEffect(() => {
        setLabelArquivado(chatArquivado[chatId] ? "Desarquivar" : "Arquivar");
        setLabelFixado(chatFixado[chatId] ? "Desafixar conversa" : "Fixar");
        setLabelBloqueado(chatBloqueado[chatId] ? "Desbloquear" : "Bloquear");
        // setLabelLimpo(chatLimpo[chatId] ? "Deslimpar" : "Limpar");
        setLabelApagado(chatLimpo[chatId] ? "Restaurar conversas" : "Apagar conversas");
    }, [chatArquivado, chatFixado, chatBloqueado, chatLimpo, chatId]);

    useEffect(() => {
        if (resetRef) resetRef.current = resetarDados;
    }, [resetRef, resetarDados]);

    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpenOptions) return;

        function handleClickOutside(event) {
            // verifica wrapper + dropdown
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                onToggleOptions(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpenOptions, onToggleOptions]);

    const options = [
        {
            id: 1,
            label: "Dados do contato",
            icon: InfoRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("dados"),
            class: ""
        },
        ...(fecharConversa ? [{
            id: 2,
            label: "Fechar conversa",
            icon: CloseCircle,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("fechar"),
            class: ""
        }] : []),
        {
            id: 3,
            label: `${labelFixado}`,
            icon: chatFixado[chatId] ? UnpinRefreshedIcon : PinRefreshedIcon,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("fixar"),
            class: ""
        },
        {
            id: 4,
            label: `${labelArquivado} conversa`,
            icon: ArchiveRefreshedIcon,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("arquivar"),
            class: ""
        },
        {
            id: 5,
            label: "<hr>",
        },
        {
            id: 6,
            label: labelBloqueado,
            icon: chatBloqueado[chatId] ? BlockRefreshedIcon : BlockRefreshedIcon,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("bloquear"),
            class: chatBloqueado[chatId] ? "" : "redHover"
        },
        // {
        //     id: 7,
        //     label: `${labelLimpo} conversa`,
        //     icon: ClearCircleRefreshed,
        //     color: "rgba(0, 0, 0, .6)",
        //     onClick: () => chamaFuncao("limpar"),
        //     class: "redHover"
        // },
        {
            id: 8,
            label: labelApagado,
            icon: chatLimpo[chatId] ? UnDeleteRefreshed : DeleteRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("apagar"),
            class: "redHover"
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
                onToggleOptions(false);
                break;

            case "arquivar":
                if (onOptionSelect) onOptionSelect(optionLabel);
                break;

            case "fixar":
                if (onOptionSelect) onOptionSelect(optionLabel);
                break;

            case "bloquear":
                if (onOptionSelect) setShowModal(true);
                onToggleOptions(false);
                setTituloConfirma(`Deseja ${chatBloqueado[chatId] ? "desbloquear" : "bloquear"} ${getFirstName(chatName)}`);
                setMsgConfirma(`${chatBloqueado[chatId] ? "A pessoa voltará a enviar mensagens para você. Ela saberá que foi desbloqueada" : "A pessoa não poderá mais enviar mensagens para você. Ela saberá que foi bloqueada"}.`);
                break;

            case "limpar":
                if (onOptionSelect) setShowModal(true);
                onToggleOptions(false);
                setTituloConfirma("Deseja limpar esta conversa?");
                setMsgConfirma("A conversa ficará vazia, mas ficará na sua lista de conversas.");
                break;

            case "apagar":
                if (onOptionSelect) setShowModal(true);
                onToggleOptions(false);
                setTituloConfirma(`Deseja ${chatLimpo[chatId] ? "restaurar" : "apagar"} a conversa com ${getFirstName(chatName)}?`);
                setMsgConfirma(`As mensagens serão ${chatLimpo[chatId] ? "restauradas" : "removidas"}.`);
                break;

            default:
                break;
        }
    }

    const confirmAcao = async () => {
        onOptionSelect(selectedOption)
        setShowModal(false);
    };

    const cancelAcao = () => {
        onOptionSelect(null);
        setShowModal(false);
    };

    function getFirstName(fullName) {
        const names = fullName.split(" ");
        return names[0];
    }

    // Função que carrega os dados do usuário
    function carregarDadosUsuario(id) {
        // Aqui poderia vir de uma API, mas vou simular:
        const fakeUser = {
            id,
            name: dadosUsuario.name,
            email: dadosUsuario.email,
            image: dadosUsuario.image,
            type: dadosUsuario.type,
        };

        if (dadosUsuario.type === "preview") {
            setUserData(fakeUser);
            setPreviewDados({ type: "text/plain" });
            console.log(fakeUser)
        } else {
            console.log(fakeUser)
        }
        onToggleOptions(false);
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
    const getAvatar = avatar => avatar ? `${API_URL}/uploads/${avatar}` : "/images/avatar.png";

    const previewModal = previewDados && (
        <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div
                className={`preview-content dados`}
            >
                <img
                    src={getAvatar(userData?.image)}
                    alt={userData?.name}
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

    const dropOpt = (
        <div
            className={`attachment-dropdown ${closing ? "closed" : "open"} ${dropDirection}`}
            onClick={(e) => e.stopPropagation()}
            style={{
                ...dropStyle,
                position: "fixed",
            }}
        >
            {options.map((opt, index) => {
                const Icon = opt.icon;
                if (opt.label === "<hr>") return <hr key={index} style={{ borderColor: "rgba(0,0,0,.1)", margin: 4 }} />;
                if (chatArquivado[chatId] && opt.id === 3) return null;

                return (
                    <div
                        style={{ minWidth: "210px", transitionDelay: `${index * 30}ms` }}
                        key={index}
                        className={`attachment-option ${opt.class}`}
                        onClick={opt.onClick || (() => onToggleOptions(false))}
                    >
                        <Icon size={26} color={opt.color} direction={chatArquivado[chatId] ? "up" : "down"} />
                        <span style={{ color: "rgba(0,0,0,.6)", fontSize: ".9375rem" }}>{opt.label}</span>
                    </div>
                );
            })}
        </div>
    );

    function usePortal(id = "portal-root") {
        const elRef = useRef(null);

        if (!elRef.current) {
            const el = document.createElement("div");
            el.id = id;
            elRef.current = el;
        }

        useEffect(() => {
            const portalRoot = document.body;
            portalRoot.prepend(elRef.current);
            return () => portalRoot.removeChild(elRef.current);
        }, []);

        return elRef.current;
    }

    const imagemModal = (
        <ImageModal
            show={!!selectedMedia}
            imageUrl={selectedMedia?.url}
            type={selectedMedia?.type}
            onClose={closeImageModal}
        />
    );

    const confirmarModal = (
        <ConfirmModal
            show={showModal}
            title={tituloConfirma}
            message={msgConfirma}
            onConfirm={confirmAcao}
            onCancel={cancelAcao}
        />
    );

    const portalContainer = usePortal();

    return (
        <div
            className="chat-attachment"
            ref={wrapperRef}
            style={{
                marginLeft: "auto",
                position: "relative",
                whiteSpace: "nowrap",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                aria-expanded={isOpenOptions}
                className={`${isOpenOptions ? "active" : ""}`}
                onClick={() => onToggleOptions(!isOpenOptions)}
                style={{ zIndex: 1 }}
            >
                <IconB />
            </button>

            {
                previewDados &&
                (() => {
                    const container = document.querySelector(
                        `.chat-window[data-chat-id="${chatId}"] .div-preview`
                    );
                    if (container) return createPortal(previewModal, container);
                    return null;
                })()
            }

            {
                isVisible &&
                (() => {
                    let container = document.getElementById("chat-dropdown-portal");
                    if (!container) {
                        container = document.createElement("div");
                        container.id = "chat-dropdown-portal";
                        document.body.prepend(container);
                    }
                    return createPortal(
                        <div ref={dropdownRef}>{dropOpt}</div>,
                        container
                    );
                })()
            }

            {createPortal(imagemModal, portalContainer)}
            {createPortal(confirmarModal, portalContainer)}


        </div>
    );
}
