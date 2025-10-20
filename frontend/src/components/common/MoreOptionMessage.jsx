import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import InfoRefreshed from "./icons/InfoRefreshed";
import CopyRefreshed from "./icons/CopyRefreshed";
import ReplyRefreshed from "./icons/ReplyRefreshed";
import DeleteRefreshed from "./icons/DeleteRefreshed";
import IcMood from "./icons/IcMood";
import ForwardRefreshed from "./icons/ForwardRefreshed";
import PinRefreshedIcon from "./icons/PinRefreshedIcon";
import StarRefreshed from "./icons/StarRefreshed";
import MoreRefreshed from "./icons/MoreRefreshed";
import PencilRefreshed from "./icons/PencilRefreshed";
import ArrowDropIcon from "./icons/ArrowDropIcon";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import EmojiDropdown from "./EmojiDropdown";
import SendFilledIcon from "./icons/SendFilledIcon";
import AlertModal from "./AlertModal";

const icons = {
    MoreRefreshed,
    ArrowDropIcon,
};

import ConfirmModalApagarMsg from "./ConfirmModalApagarMsg";

import "./ChatAttachment.css";

export default function ChatAttachment({
    iconBotao,
    resetRef,
    msgId,
    dadosMensagem,
    isOpenOptions,
    onToggleOptions,
    editarMensagem,
    setDirection,
    setOpenMensagem,
    chatId
}) {
    const wrapperRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [msgData, setMsgData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tituloConfirma, setTituloConfirma] = useState(null);
    const [msgConfirma, setMsgConfirma] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const IconB = icons[iconBotao];
    const [dropStyle, setDropStyle] = useState({});
    const [dropDirection, setDropDirection] = useState("down");
    const [openEditar, setOpenEditar] = useState(false);
    const textareaRefs = useRef({});
    const [inputs, setInputs] = useState({});
    const [emojiStates, setEmojiStates] = useState({});
    const [msgEditar, setMsgEditar] = useState("");
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);

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
            const dropdownHeight = 185;
            const spaceBottom = window.innerHeight - buttonRect.bottom;
            const spaceTop = buttonRect.top;

            let top = buttonRect.bottom - 5;
            let direction = "down";

            if (spaceBottom < dropdownHeight && spaceTop > spaceBottom) {
                top = buttonRect.top - dropdownHeight - 8;
                direction = "up";
            }

            const lado = setDirection === "own" ? "right" : "left";
            const translateY = direction === "down" ? 6 : -6;

            const ladoRight = setDirection === "own" ? window.innerWidth - buttonRect.right + 10 : window.innerWidth - buttonRect.right - 200;

            setDropStyle({
                position: "absolute",
                top: top,
                right: ladoRight,
                minWidth: "210px",
                zIndex: 1001,
                transform: `scale(0.85) translateY(${translateY}px)`,
                opacity: 0,
                transformOrigin: direction === "down" ? `top ${lado}` : `bottom ${lado}`,
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
    }, [isOpenOptions, dropDirection, isVisible, setDirection]);

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

    useEffect(() => {
        if (openEditar && dadosMensagem?.mensagem) {
            setInputs(prev => ({ ...prev, [chatId]: dadosMensagem.mensagem }));
        }
    }, [openEditar, dadosMensagem, chatId]);

    const options = [
        {
            id: 1,
            label: "Dados da mensagem",
            icon: InfoRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("dados"),
            class: ""
        },
        // {
        //     id: 2,
        //     label: "Responder",
        //     icon: ReplyRefreshed,
        //     color: "rgba(0, 0, 0, .6)",
        //     onClick: () => chamaFuncao("responder"),
        //     class: ""
        // },
        {
            id: 3,
            label: "Copiar",
            icon: CopyRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("copiar"),
            class: ""
        },
        // {
        //     id: 4,
        //     label: "Reagir",
        //     icon: IcMood,
        //     color: "rgba(0, 0, 0, .6)",
        //     onClick: () => chamaFuncao("reagir"),
        //     class: ""
        // },
        // {
        //     id: 5,
        //     label: "Encaminhar",
        //     icon: ForwardRefreshed,
        //     color: "rgba(0, 0, 0, .6)",
        //     onClick: () => chamaFuncao("encaminhar"),
        //     class: ""
        // },
        // {
        //     id: 6,
        //     label: "Fixar",
        //     icon: PinRefreshedIcon,
        //     color: "rgba(0, 0, 0, .6)",
        //     onClick: () => chamaFuncao("fixar"),
        //     class: ""
        // },
        // {
        //     id: 7,
        //     label: "Favoritar",
        //     icon: StarRefreshed,
        //     color: "rgba(0, 0, 0, .6)",
        //     onClick: () => chamaFuncao("favoritar"),
        //     class: ""
        // },
        {
            id: 8,
            label: "<hr>",
        },
        {
            id: 9,
            label: "Editar mensagem",
            icon: PencilRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("editar"),
            class: ""
        },
        {
            id: 10,
            label: "Apagar mensagem",
            icon: DeleteRefreshed,
            color: "rgba(0, 0, 0, .6)",
            onClick: () => chamaFuncao("apagar"),
            class: "redHover"
        },
    ];

    function chamaFuncao(optionLabel) {
        setSelectedOption(optionLabel);

        switch (optionLabel) {
            case "editar":
                setOpenEditar(true);
                setOpenMensagem(true);
                onToggleOptions(false);
                break;
            case "apagar":
                onToggleOptions(false);
                setTituloConfirma(`Deseja apagar a mensagem?`);
                setMsgConfirma(`As mensagens será removida`);
                break;
        }
    }

    const confirmAcaoAll = async () => {
        setShowModal(false);
    };

    const confirmAcaoMe = async () => {
        setShowModal(false);
    };

    // Função que carrega os dados do usuário
    function carregarDadosMensagem(id) {
        const fakeMessage = {
            id,
            mensagem: dadosMensagem.mensagem,
            created_at: dadosMensagem.created_at,
            read_at: dadosMensagem.read_at,
        };

        setMsgData(fakeMessage);
        onToggleOptions(false);
    }

    const toggleEmoji = (id, open) => {
        setEmojiStates(() => {
            if (!open) return {};
            return { [id]: { open: true } };
        });
    };

    const handleEmojiSelect = (chatId, emoji, numberOption) => {
        const inputEl = inputs.current[numberOption];
        if (!inputEl) return;

        const start = inputEl.selectionStart || 0;
        const end = inputEl.selectionEnd || 0;

        // Valor antes da alteração: podemos pegar do estado ou do input
        let currentValue = inputEl.value;

        // Computa novo valor inserindo emoji
        const newValue = currentValue.slice(0, start) + emoji + currentValue.slice(end);

        setMsgEditar(newValue);

        // Reposiciona cursor no input
        requestAnimationFrame(() => {
            inputEl.setSelectionRange(start + emoji.length, start + emoji.length);
            inputEl.focus();
        });
    };

    const handleSendFile = async () => {

        if (!previewModal) return;

        const mensagem = inputs?.value || "";

        if (!mensagem) {
            setAlertMessage("A mensagem não pode estar vazia!");
            setShowAlert(true);
            return;
        }

        const message = {
            id: msgId,
            type: selectedOption,
            content: msgEditar,
            metadata: {}
        };

        editarMensagem(false, message);
        closeEdit();
    };

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

                return (
                    <div
                        style={{ minWidth: "210px", transitionDelay: `${index * 30}ms` }}
                        key={index}
                        className={`attachment-option ${opt.class}`}
                        onClick={opt.onClick || (() => onToggleOptions(false))}
                    >
                        <Icon size={26} color={opt.color} direction={"down"} />
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

    const cancelAcao = () => {
        setShowModal(false);
    };

    const confirmarModal = (
        <ConfirmModalApagarMsg
            show={showModal}
            title={tituloConfirma}
            all={true}
            onConfirmAll={confirmAcaoAll}
            onConfirmMe={confirmAcaoMe}
            onCancel={cancelAcao}
        />
    );

    const closeEdit = () => {
        setOpenEditar(false);
        setOpenMensagem(false);
    }

    const previewModal = (
        <div className="preview-modal">
            <div className={`preview-content evento`}>

                <div className="container-file-preview enquete">
                    <div style={{
                        marginBottom: 50,
                        marginTop: 20,
                        fontSize: "1.5rem",
                        color: "#aebac1"
                    }}>Editar mensagem</div>
                    <div style={{ fontSize: "1rem", color: "rgb(174, 186, 193)", width: "90%", position: "relative", minHeight: "150px", backgroundColor: "#F5F1EB", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}>
                        <div class="background"></div>
                        <div className="chat-message-row own message-item" style={{ justifyContent: "center", }}>
                            <div className="chat-message-bubble ">
                                <span>{dadosMensagem.mensagem}</span>
                                <span className="message-time send false">01:18</span>
                                <span className="message-status false"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="preview-actions">
                    <button
                        type="button"
                        className={`options-footer options-file`}
                        onClick={() => {
                            closeEdit();
                        }}
                    >
                        <div className="icon-container">
                            <CloseRoundedIcon size={24} color="#0A0A0A" />
                        </div>
                    </button>
                    {(selectedOption !== "enquete" && selectedOption !== "evento") && (
                        <>
                            <textarea
                                ref={el => (textareaRefs.current[chatId] = el)}
                                placeholder="Digite sua mensagem..."
                                className="chat-message-preview"
                                value={inputs[chatId] || ""}
                                onChange={e => setInputs(prev => ({ ...prev, [chatId]: e.target.value }))}
                            />
                            <span className="options-footer-emoji-preview">
                                <EmojiDropdown
                                    icon={false}
                                    chatIdEmoji={chatId}
                                    isOpenEmoji={emojiStates[0]?.open || false}
                                    onToggleEmoji={(open) => toggleEmoji(0, open)}
                                    onSelectEmoji={handleEmojiSelect}
                                    numberOption={0}
                                />
                            </span>
                        </>
                    )}
                    <span
                        className="options-footer options-send"
                        onClick={handleSendFile}
                    >
                        <SendFilledIcon size={24} color="#ffffff" />
                    </span>
                </div>
            </div>
        </div>
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
                className={`opt_msg ${isOpenOptions ? "active" : ""}`}
                onClick={() => onToggleOptions(!isOpenOptions)}
                style={{ zIndex: 1 }}
            >
                <IconB />
            </button>

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

            {createPortal(confirmarModal, portalContainer)}

            <AlertModal
                show={showAlert}
                title="Atenção"
                message={alertMessage}
                onClose={() => setShowAlert(false)}
            />

            {openEditar && (() => {
                const container = document.querySelector(`.chat-window[data-chat-id="chat-${chatId}"] .div-preview`);
                if (container) return createPortal(previewModal, container);
                return null;
            })()}

        </div>
    );
}
