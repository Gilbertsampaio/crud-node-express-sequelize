import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../api/api";
import "./ChatWidget.css";
import {
    FaChevronUp,
    FaChevronDown,
    FaTimes,
    FaSearch,
    FaPlus,
    FaPaperclip,
    FaRegImage,
    FaRegSmile,
    FaPaperPlane,
    FaCheck,
    FaCheckDouble,
} from "react-icons/fa";
import useAuth from "../../context/useAuth";
import TypingIndicator from "./TypingIndicator";
import MsgDoubleCheckIcon from "./icons/MsgDoubleCheckIcon";
import ExpressionsIcon from "./icons/ExpressionsIcon";
import PlusRoundedIcon from "./icons/PlusRoundedIcon";
import SendFilledIcon from "./icons/SendFilledIcon";
import MaximizeSmallIcon from "./icons/MaximizeSmallIcon";
import MinimizeSmallIcon from "./icons/MinimizeSmallIcon";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import MicOutlined from "./icons/MicOutlined";
import ChatAttachment from "./ChatAttachment";
import EmojiDropdown from "./EmojiDropdown";
import ChatMessage from "./ChatMessage";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [_chats, setChats] = useState([]);
    const [visibleChats, setVisibleChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [inputs, setInputs] = useState({});
    const { user } = useAuth();
    const chatPanelRef = useRef(null);
    const [panelHeight, setPanelHeight] = useState(0);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
    const [typingStatus, setTypingStatus] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    const textareaRefs = useRef({});
    const chatBodyRefs = useRef({});
    const [openAttachment, setOpenAttachment] = useState(null);
    const [openEmoji, setOpenEmoji] = useState(null);
    const [maximizarChat, setMaximizarChat] = useState(null);
    const [previewFiles, setPreviewFiles] = useState({});
    const attachmentRefs = useRef({});

    const ws = useRef(null);

    // --- refs para leitura ---
    const observersRef = useRef(new Map()); // chatId -> observer
    const pendingReadsRef = useRef(new Map()); // chatId -> Set(messageIds)
    const flushTimerRef = useRef(null);

    useEffect(() => {
        const openedChat = visibleChats.find(c => c.open);
        if (openedChat && textareaRefs.current[openedChat.id]) {
            textareaRefs.current[openedChat.id].focus();
        }
    }, [visibleChats]);

    const messagesCountKey = visibleChats.map(c => c.messages.length).join(",");

    useEffect(() => {
        visibleChats.forEach(c => {
            const chatBody = chatBodyRefs.current[c.id];
            if (chatBody) {
                chatBody.scrollTo({
                    top: chatBody.scrollHeight,
                    behavior: "smooth",
                });
            }
        });
    }, [messagesCountKey, visibleChats, typingStatus]);

    useEffect(() => {
        const openedChat = visibleChats.find(c => c.open);
        if (openedChat) {
            const chatBody = chatBodyRefs.current[openedChat.id];
            if (chatBody) {
                chatBody.scrollTo({
                    top: chatBody.scrollHeight,
                    behavior: "smooth",
                });
            }
            if (textareaRefs.current[openedChat.id]) {
                textareaRefs.current[openedChat.id].focus();
            }
        }
    }, [visibleChats]);

    useEffect(() => {
        const fetchUnreadCounts = async () => {
            try {
                const res = await api.get(`/messages/unread-count/${user.id}`);
                const unreadArray = Array.isArray(res.data) ? res.data : res.data.data || [];

                const countsMap = {};
                unreadArray.forEach(item => {
                    countsMap[item.chatId] = item.count;
                });

                setUnreadCounts(countsMap);
            } catch (err) {
                console.error("Erro ao buscar mensagens não lidas:", err);
            }
        };

        fetchUnreadCounts();
        // const interval = setInterval(fetchUnreadCounts, 10000);
        // return () => clearInterval(interval);
    }, [user.id]);

    const scheduleFlush = useCallback(() => {
        if (flushTimerRef.current) return;
        flushTimerRef.current = setTimeout(() => flushPendingReads(), 300);
    }, []);

    const flushPendingReads = async () => {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;

        const pending = pendingReadsRef.current;
        if (!pending || pending.size === 0) return;

        for (const [chatId, setIds] of Array.from(pending.entries())) {
            const ids = Array.from(setIds);
            if (ids.length === 0) {
                pending.delete(chatId);
                continue;
            }

            // envia via WS
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: "read", payload: { chatId: Number(chatId), userId: user.id, messageIds: ids } }));
            } else {
                try {
                    await api.post("/messages/read-batch", { messageIds: ids, readerId: user.id });
                } catch (err) {
                    console.error("fallback read-batch erro:", err);
                }
            }

            // optimistic update local
            setChats(prev =>
                prev.map(c =>
                    c.id === Number(chatId)
                        ? { ...c, messages: c.messages.map(m => (ids.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m)) }
                        : c
                )
            );

            // **Atualiza o contador de não lidas**
            setUnreadCounts(prev => {
                const currentCount = prev[chatId] || 0;
                const newCount = Math.max(currentCount - ids.length, 0);
                return { ...prev, [chatId]: newCount };
            });

            pending.delete(chatId);
        }
    };

    useEffect(() => {
        let reconnectInterval;

        const connectWS = () => {
            ws.current = new WebSocket("ws://localhost:3000");

            ws.current.onopen = () => {
                if (ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({ type: "register", userId: user.id }));
                }
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "message") {
                    const msg = data.message;
                    const chatId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

                    setChats(prev => {
                        const exists = prev.find(c => c.id === chatId);

                        // AQUI ESTÁ O ERRO: em vez de adicionar 1, vamos recalcular.
                        // setUnreadCounts(prevCounts => {
                        //     if (!exists || !exists.open) {
                        //         return { ...prevCounts, [chatId]: (prevCounts[chatId] || 0) + 1 };
                        //     }
                        //     return prevCounts;
                        // });

                        let updated;
                        if (exists) {
                            updated = prev.map(c =>
                                c.id === chatId ? { ...c, messages: [...(c.messages || []), msg] } : c
                            );
                        } else {
                            // Se o chat não existe, não faz sentido adicionar 1 ao contador.
                            // A busca de histórico já vai definir a contagem corretamente depois.
                            // Para simplificar, a contagem de não lidas não deve ser atualizada aqui.
                            // A contagem será atualizada pelo fetchUsersAndMessages ou pela API
                            // do unread-count, o que for mais relevante no seu fluxo.
                            fetchUserAndMessages(chatId, msg).then(({ userData, history }) => {
                                setChats(prevChats => {
                                    if (prevChats.find(c => c.id === chatId)) return prevChats;
                                    const newChat = {
                                        id: chatId,
                                        name: userData?.name || msg.sender_name || "Usuário",
                                        image: userData?.image || null,
                                        is_online: userData?.is_online ?? true,
                                        open: false,
                                        messages: history.length ? history : [msg]
                                    };
                                    const updatedChats = [newChat, ...prevChats];
                                    updateVisibleChats(updatedChats);

                                    // Recalcula o unreadCount para o novo chat
                                    setUnreadCounts(prevCounts => ({
                                        ...prevCounts,
                                        [chatId]: newChat.messages.filter(m => !m.read_at && m.sender_id !== user.id).length
                                    }));

                                    return updatedChats;
                                });
                            });
                            return prev;
                        }

                        // NOVO CÁLCULO: Recalcula a contagem de não lidas a partir do array `updated`
                        // apenas para o chat que recebeu a mensagem.
                        const chatToUpdate = updated.find(c => c.id === chatId);
                        if (chatToUpdate) {
                            setUnreadCounts(prevCounts => ({
                                ...prevCounts,
                                [chatId]: chatToUpdate.messages.filter(m => !m.read_at && m.sender_id !== user.id).length
                            }));
                        }

                        updateVisibleChats(updated);
                        return updated;
                    });
                }

                if (data.type === "status") {
                    setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, is_online: data.is_online } : u));
                    setChats(prev => prev.map(c => c.id === data.userId ? { ...c, is_online: data.is_online } : c));
                }

                if (data.type === "typing") {
                    const { senderId, receiverId, isTyping } = data.payload;
                    if (receiverId === user.id) setTypingStatus(prev => ({ ...prev, [senderId]: isTyping }));
                }

                if (data.type === "read") {
                    const { chatId, messageIds } = data.payload;

                    if (messageIds.length > 0) {
                        setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
                    }

                    setChats(prevChats => {
                        // Primeiro, crie a nova lista de chats com as mensagens atualizadas.
                        const updatedChats = prevChats.map(c => {
                            if (c.id === chatId) {
                                // Retorne um NOVO objeto de chat com o array de mensagens atualizado.
                                return {
                                    ...c,
                                    messages: c.messages.map(m =>
                                        (messageIds.includes(m.id) && m.sender_id === user.id)
                                            ? { ...m, read_at: new Date().toISOString() }
                                            : m
                                    )
                                };
                            }
                            return c;
                        });

                        // Agora, use a nova lista para atualizar os chats visíveis.
                        // Isso garante que o estado visível esteja sempre sincronizado.
                        updateVisibleChats(updatedChats);

                        // Retorne a nova lista de chats completa para atualizar o estado.
                        return updatedChats;
                    });
                }
            };

            ws.current.onclose = () => reconnectInterval = setTimeout(connectWS, 3000);
            ws.current.onerror = () => ws.current.close();
        };

        connectWS();
        return () => {
            clearTimeout(reconnectInterval);
            if (ws.current && ws.current.readyState === WebSocket.OPEN) ws.current.close();
        };
    }, [user]);

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (open && chatPanelRef.current) setPanelHeight(chatPanelRef.current.scrollHeight);
        else setPanelHeight(0);
    }, [open]);

    const fetchUsers = async () => {
        try {
            const resUsers = await api.get("/users/online");
            setUsers(resUsers.data);
        } catch {
            setError("Erro ao buscar usuários.");
        }
    };

    const getAvatar = avatar => avatar ? `${API_URL}/uploads/${avatar}` : "/images/avatar.png";
    const updateVisibleChats = list => setVisibleChats(list.slice(0, 3));

    const fetchUserAndMessages = async (chatId, msg) => {
        try {
            // 1. busca histórico
            const resMessages = await api.get(`/messages/${chatId}?currentUserId=${user.id}`);
            const history = resMessages.data;

            // 2. busca dados do usuário
            let userData;
            try {
                const resUser = await api.get(`/users/${chatId}`);
                userData = resUser.data;
            } catch {
                userData = { name: msg.sender_name || "Usuário", image: null, is_online: true };
            }

            return { userData, history };
        } catch {
            return { userData: { name: msg.sender_name || "Usuário", image: null, is_online: true }, history: [msg] };
        }
    };

    const openChat = async selectedUser => {
        try {
            const res = await api.get(`/messages/${selectedUser.id}?currentUserId=${user.id}`);
            const history = res.data;

            setChats(prev => {
                let updated = prev.map(c => {
                    if (c.open && c.id !== selectedUser.id) {
                        // minimiza o chat que estava aberto
                        attachmentRefs.current[c.id]?.current?.(); // reseta apenas deste chat
                        if (openAttachment === c.id) setOpenAttachment(null);
                        return { ...c, open: false };
                    }
                    return c;
                });

                const exists = updated.find(c => c.id === selectedUser.id);
                if (exists) {
                    updated = updated.map(c =>
                        c.id === selectedUser.id ? { ...c, open: true, messages: history } : c
                    );
                } else {
                    updated.unshift({ ...selectedUser, open: true, messages: history });
                }

                updateVisibleChats(updated);
                return updated;
            });
        } catch {
            setError("Erro ao buscar mensagens.");
        }
    };

    const toggleChat = id => setChats(prev => {
        const updated = prev.map(c => {
            if (c.id === id) {
                // Se o chat já estava aberto, vai minimizar: reset preview
                if (c.open) {
                    attachmentRefs.current[c.id]?.current?.(); // reset preview
                    if (openAttachment === c.id) setOpenAttachment(null);
                }
                // Alterna o estado do chat clicado
                return { ...c, open: !c.open };
            }

            if (c.open && c.id !== id) {
                // Chat que vai ser minimizado automaticamente
                attachmentRefs.current[c.id]?.current?.(); // reset preview
                if (openAttachment === c.id) setOpenAttachment(null);
                return { ...c, open: false };
            }

            return c;
        });

        updateVisibleChats(updated);

        if (maximizarChat === id) setMaximizarChat(null);

        return updated;
    });

    const closeChat = id => {
        setChats(prev => {
            const updated = prev.filter(c => c.id !== id);
            updateVisibleChats(updated);
            return updated;
        });

        setInputs(prev => ({ ...prev, [id]: "" }));
        setPreviewFiles(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });

        if (openAttachment === id) setOpenAttachment(null);
        if (maximizarChat === id) setMaximizarChat(null);
    };

    const maxChat = id => {
        setMaximizarChat(maximizarChat === id ? null : id);
    };

    const typingTimers = useRef({});

    const handleInputChange = (chatId, value) => {
        setInputs((prev) => ({ ...prev, [chatId]: value }));

        // envia isTyping = true imediatamente
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: "typing",
                payload: { senderId: user.id, receiverId: chatId, isTyping: true }
            }));
        }

        // limpa timer anterior
        if (typingTimers.current[chatId]) {
            clearTimeout(typingTimers.current[chatId]);
        }

        // define timer para enviar isTyping = false após 2s de pausa
        typingTimers.current[chatId] = setTimeout(() => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    type: "typing",
                    payload: { senderId: user.id, receiverId: chatId, isTyping: false }
                }));
            }
            delete typingTimers.current[chatId];
        }, 2000);
    };

    const handleSendMessage = chatId => {
        const text = inputs[chatId];
        if (!text?.trim()) return;
        const message = { senderId: user.id, receiverId: chatId, content: text, msgType: "text", metadata: {} };
        if (ws.current && ws.current.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "message", payload: message }));
        setInputs(prev => ({ ...prev, [chatId]: "" }));
    };

    // --- Observer para marcar mensagens visíveis ---
    useEffect(() => {
        // desconecta antigos
        observersRef.current.forEach(o => o.disconnect());
        observersRef.current.clear();

        const currentObservers = new Map();

        visibleChats.forEach(c => {
            const chatWindow = document.querySelector(`.chat-window[data-chat-id="${c.id}"]`);
            if (!chatWindow) return;
            const chatBody = chatWindow.querySelector(".chat-body");
            if (!chatBody) return;

            const observer = new IntersectionObserver(entries => {
                if (document.visibilityState !== "visible") return;
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const messageId = Number(el.dataset.messageId);
                    const receiverId = el.dataset.receiverId;
                    if (String(receiverId) !== String(user.id)) return;

                    const setIds = pendingReadsRef.current.get(c.id) || new Set();
                    setIds.add(messageId);
                    pendingReadsRef.current.set(c.id, setIds);

                    observer.unobserve(el);
                    scheduleFlush();
                });
            }, { root: chatBody, threshold: 0.6 });

            const msgEls = Array.from(chatBody.querySelectorAll(".message-item"));
            msgEls.forEach(el => { if (!el.dataset.readAt) observer.observe(el); });

            currentObservers.set(c.id, observer);
        });

        observersRef.current = currentObservers;

        // cleanup
        return () => {
            currentObservers.forEach(o => o.disconnect());
        };
    }, [visibleChats, _chats, scheduleFlush, user.id]);

    useEffect(() => {
        const onVis = () => { if (document.visibilityState === "visible") scheduleFlush(); };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    const handleEmojiSelect = (chatId, emoji) => {
        setInputs(prev => ({
            ...prev,
            [chatId]: (prev[chatId] || "") + emoji,
        }));
        setTimeout(() => {
            if (textareaRefs.current[chatId]) textareaRefs.current[chatId].focus();
        }, 0);
    };

    return (
        <>
            <div className="chat-widget">
                {/* barra */}
                <div
                    className="chat-bar"
                    onClick={() => setOpen(!open)}
                >
                    <span className="image" style={{ backgroundImage: `url(${getAvatar(user?.image)})` }} />
                    <span className="chat-bar-text">
                        Mensagens
                        {/* Total de não lidas */}
                        {Object.values(unreadCounts).reduce((total, count) => total + count, 0) > 0 && (
                            <span className="unread-badge-total">
                                <span>{Object.values(unreadCounts).reduce((total, count) => total + count, 0)}</span>
                            </span>
                        )}
                    </span>
                    {open ? <FaChevronDown /> : <FaChevronUp />}
                </div>

                <div ref={chatPanelRef} className="chat-panel" style={{ maxHeight: `${panelHeight}px` }}>
                    <span className="search"><FaSearch /></span>
                    <input type="text" placeholder="Pesquisar mensagens" className="chat-search" />
                    <div className="chat-users-list">
                        {error ? (
                            <div>{error}</div>
                        ) : (
                            users
                                .filter(u => u.id !== user.id).map(u => {
                                    return (
                                        <div key={u.id} className="chat-user" onClick={() => openChat(u)}>
                                            <span
                                                className={`image ${typingStatus[u.id] ? "typing-effect" : ""}`}
                                                style={{ backgroundImage: `url(${getAvatar(u.image)})` }}
                                            />
                                            <span style={{ textAlign: "left", display: "flex", flexDirection: "column", paddingTop: 10 }}>
                                                <span>{u.name}</span>
                                                <div className="typing-label">{typingStatus[u.id] ? "escrevendo..." : "\u00A0"}</div>
                                            </span>
                                            <span className={`status ${u.is_online ? "online" : "offline"}`} />
                                            {unreadCounts[u.id] > 0 && (
                                                <span className="unread-badge">
                                                    <span>{unreadCounts[u.id]}</span>
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

                <div className="chat-windows">
                    {visibleChats.map(c => (
                        <div key={c.id} className={`chat-window ${c.open ? "open" : "closed"}`} data-chat-id={c.id}>
                            <div className="chat-header" onClick={(e) => { if (e.target.closest("button")) return; toggleChat(c.id); }}>
                                <span className="image" style={{ backgroundImage: `url(${getAvatar(c.image)})` }} />
                                <span>{c.name}</span>
                                {/* <span className={`status ${c.is_online ? "online" : "offline"}`} /> */}
                                <span style={{ marginLeft: "auto" }}>
                                    {c.open && (
                                        <button onClick={() => maxChat(c.id)}>
                                            {maximizarChat === c.id ? (
                                                <MinimizeSmallIcon size={20} color="#0A0A0A" />
                                            ) : (
                                                <MaximizeSmallIcon size={20} color="#0A0A0A" />
                                            )}

                                        </button>
                                    )}
                                    <button onClick={() => closeChat(c.id)}><CloseRoundedIcon size={24} color="#0A0A0A" /></button>
                                </span>
                            </div>

                            <div className={`chat-container ${maximizarChat === c.id ? "max" : ""}`}>
                                <div className="background"></div>
                                <div className="div-preview">
                                    <div
                                        className="chat-body"
                                        
                                    >
                                        <div className="container-chat">
                                            {c.messages?.map((m, idx) => {
                                                return (
                                                    <ChatMessage
                                                        key={idx}
                                                        message={m}
                                                        currentUser={user}
                                                        chatName={c.name}
                                                    />
                                                );
                                            })}
                                            {typingStatus[c.id] && (
                                                <div className="chat-message-row other">
                                                    <div className="chat-message-bubble"><TypingIndicator /></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-footer" ref={el => (chatBodyRefs.current[c.id] = el)}>
                                    <div className="container-chat">
                                        <textarea
                                            ref={el => (textareaRefs.current[c.id] = el)}
                                            placeholder="Digite sua mensagem..."
                                            className="chat-message"
                                            value={inputs[c.id] || ""}
                                            onChange={(e) => handleInputChange(c.id, e.target.value)}
                                        />

                                        <ChatAttachment
                                            resetRef={attachmentRefs.current[c.id] = attachmentRefs.current[c.id] || React.createRef()}
                                            chatId={c.id}
                                            previewFile={previewFiles[c.id]}
                                            setPreviewFile={(file) => setPreviewFiles(prev => ({ ...prev, [c.id]: file }))}
                                            chatBodyRef={chatBodyRefs.current[c.id]}
                                            isOpenAttachment={openAttachment === c.id}
                                            onToggleAttachment={(open, payload) => {
                                                setOpenAttachment(open ? c.id : null);

                                                // ajusta para enviar qualquer arquivo, mas mantém envio automático para imagens
                                                if (payload) {
                                                    // const msgType = payload.type === "file" && payload.metadata?.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)
                                                    //     ? "image"
                                                    //     : payload.type;

                                                    ws.current.send(JSON.stringify({
                                                        type: "message",
                                                        payload: {
                                                            senderId: user.id,
                                                            receiverId: c.id,
                                                            content: payload.content,
                                                            msgType: payload.type,
                                                            metadata: payload.metadata,
                                                        },
                                                    }));
                                                }
                                            }}
                                        />
                                        {/* <ChatAttachment
                                            isOpenAttachment={openAttachment === c.id}
                                            onToggleAttachment={(open, payload) => {
                                                setOpenAttachment(open ? c.id : null);

                                                if (payload?.type === "image") {
                                                    // envia pelo WS a nova mensagem
                                                    ws.current.send(JSON.stringify({
                                                        type: "message",
                                                        payload: {
                                                            senderId: user.id,
                                                            receiverId: c.id,
                                                            content: payload.content, // "[image]" ou vazio
                                                            msgType: payload.type,    // "image"
                                                            metadata: payload.metadata // { fileName: "xxxx.jpg" }
                                                        }
                                                    }));
                                                }
                                            }}
                                        /> */}
                                        <EmojiDropdown
                                            chatIdEmoji={c.id}
                                            isOpenEmoji={openEmoji === c.id}
                                            onToggleEmoji={(open) => setOpenEmoji(open ? c.id : null)}
                                            onSelectEmoji={handleEmojiSelect}
                                        />
                                        {inputs[c.id]?.trim().length > 0 ? (
                                            <span
                                                className="options-footer options-send"
                                                onClick={() => handleSendMessage(c.id)}
                                            >
                                                <SendFilledIcon size={24} color="#ffffff" />
                                            </span>
                                        ) : (
                                            <span
                                                className="options-footer options-audio"
                                                onClick={() => handleSendMessage(c.id)}
                                            >
                                                <MicOutlined size={24} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Overlay quando o chat está aberto */}
            {open && <div className="chat-overlay" onClick={() => setOpen(false)} />}
        </>
    );
}
