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
import ArchiveRefreshedIcon from "./icons/ArchiveRefreshedIcon";
import ArrowIcon from "./icons/ArrowIcon";
import PinRefreshedIcon from "./icons/PinRefreshedIcon";
import ArrowDropIcon from "./icons/ArrowDropIcon";
import SendFilledIcon from "./icons/SendFilledIcon";
import MaximizeSmallIcon from "./icons/MaximizeSmallIcon";
import MinimizeSmallIcon from "./icons/MinimizeSmallIcon";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import MicOutlined from "./icons/MicOutlined";
import StarIcon from "./icons/StarIcon";

import BlockRefreshedIcon from "./icons/BlockRefreshedIcon";
import ChatAttachment from "./ChatAttachment";
import EmojiDropdown from "./EmojiDropdown";
import ChatMessage from "./ChatMessage";
import MoreOptionChat from "./MoreOptionChat";
import AudioRecorderBubble from "./AudioRecorderBubble";
import DetalhesEnquete from "./DetalhesEnquete";
import DetalhesEvento from "./DetalhesEvento";

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
    const [openMoreOptions, setOpenMoreOptions] = useState({});
    const [openEmoji, setOpenEmoji] = useState(null);
    const [maximizarChat, setMaximizarChat] = useState(null);
    const [previewFiles, setPreviewFiles] = useState({});
    const [previewDados, setPreviewDados] = useState({});
    const attachmentRefs = useRef({});
    const moreOptionsRefs = useRef({});
    const [archivedChats, setArchivedChats] = useState({});
    const [fixedChats, setFixedChats] = useState({});
    const [blockChats, setBlockChats] = useState({});
    const [showArchived, setShowArchived] = useState(false);
    const [blockChatsMsg, setBlockChatsMsg] = useState({});
    const blockChatsRef = useRef({});
    const [cleanChats, setCleanChats] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermArchived, setSearchTermArchived] = useState("");
    const [showDetalhesEnquete, setShowDetalhesEnquete] = useState(false);
    const [showDetalhesEvento, setShowDetalhesEvento] = useState(false);
    const [idEnquete, setIdEnquete] = useState(null);
    const [idEvento, setIdEvento] = useState(null);
    const [votos, setVotos] = useState([]);
    const [hideDropConfirma, setHideDropConfirma] = useState(false);
    const [openEvento, setOpenEvento] = useState(false);
    const [openEnquete, setOpenEnquete] = useState(false);

    const ws = useRef(null);

    // --- refs para leitura ---
    const observersRef = useRef(new Map()); // chatId -> observer
    const pendingReadsRef = useRef(new Map()); // chatId -> Set(messageIds)
    const flushTimerRef = useRef(null);

    useEffect(() => {

        const handleScroll = () => {
            setHideDropConfirma(true);

            setTimeout(() => {
                setHideDropConfirma(false);
            }, 200);
        };

        visibleChats.forEach(c => {

            const chatBody = chatBodyRefs.current[c.id];
            if (chatBody) {
                chatBody.addEventListener("scroll", handleScroll);
            }

            return () => {
                if (chatBody) {
                    chatBody.removeEventListener("scroll", handleScroll);
                }
            };
        })

    }, [chatBodyRefs, visibleChats]);

    useEffect(() => {
        async function fetchArchived() {
            try {
                const res = await api.get(`/chat/archived`);
                const mapped = {};
                res.data.forEach(chat => {
                    mapped[chat.chat_id] = true;
                });
                setArchivedChats(mapped);
            } catch (err) {
                console.error("Erro ao carregar arquivados", err);
            }
        }
        fetchArchived();
    }, []);

    useEffect(() => {
        async function fetchFixed() {
            try {
                const res = await api.get(`/chat/fixed`);
                const mapped = {};
                res.data.forEach(chat => {
                    mapped[chat.chat_id] = true;
                });
                setFixedChats(mapped);
            } catch (err) {
                console.error("Erro ao carregar fixados", err);
            }
        }
        fetchFixed();
    }, []);

    useEffect(() => {
        async function fetchBlock() {
            try {
                const res = await api.get(`/chat/blocked`);
                const mapped = {};
                res.data.forEach(chat => {
                    mapped[chat.chat_id] = true;
                    blockChatsRef.current[chat.chat_id] = true;
                });
                setBlockChats(mapped);
            } catch (err) {
                console.error("Erro ao carregar bloqueados", err);
            }
        }
        fetchBlock();
    }, []);

    useEffect(() => {
        async function fetchClean() {
            try {
                const res = await api.get(`/chat/cleaned`);
                const mapped = {};
                res.data.forEach(chat => {
                    mapped[chat.chat_id] = true;
                });
                setCleanChats(mapped);
            } catch (err) {
                console.error("Erro ao carregar limpos", err);
            }
        }
        fetchClean();
    }, []);

    const handleArchiveToggle = async (chatId) => {
        try {
            if (archivedChats[chatId]) {
                // Já arquivado → desarquivar
                await api.delete(`/chat/${chatId}/unarchive`);
                setArchivedChats(prev => {
                    const copy = { ...prev };
                    delete copy[chatId];
                    return copy;
                });
            } else {
                // Não está arquivado → arquivar
                await api.post(`/chat/${chatId}/archive`);
                setArchivedChats(prev => ({ ...prev, [chatId]: true }));
            }
        } catch (err) {
            console.error("Erro ao atualizar arquivamento", err);
        }
    };

    const handleFixeToggle = async (chatId) => {
        try {
            if (fixedChats[chatId]) {
                // Já arquivado → desarquivar
                await api.delete(`/chat/${chatId}/unpinChat`);
                setFixedChats(prev => {
                    const copy = { ...prev };
                    delete copy[chatId];
                    return copy;
                });
            } else {
                // Não está arquivado → arquivar
                await api.post(`/chat/${chatId}/pinChat`);
                setFixedChats(prev => ({ ...prev, [chatId]: true }));
            }
        } catch (err) {
            console.error("Erro ao atualizar fixamento", err);
        }
    };

    const handleBlockToggle = async (chatId) => {
        try {
            if (blockChats[chatId]) {
                // Já bloqueado → desbloquear
                await api.delete(`/chat/${chatId}/unblockChat`);
                setBlockChats(prev => {
                    const copy = { ...prev };
                    delete copy[chatId];
                    return copy;
                });

                // 🔹 Envia pelo WebSocket (tempo real)
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: "blocked",
                        payload: {
                            userId: user.id,     // quem desbloqueou
                            chatId,              // alvo
                            blockedValue: false
                        }
                    }));
                }

            } else {
                // Não está bloqueado → bloquear
                await api.post(`/chat/${chatId}/blockChat`);
                setBlockChats(prev => ({ ...prev, [chatId]: true }));

                // 🔹 Envia pelo WebSocket (tempo real)
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: "blocked",
                        payload: {
                            userId: user.id,     // quem bloqueou
                            chatId,              // alvo
                            blockedValue: true
                        }
                    }));
                }
            }

            setTimeout(() => {
                const chatBody = chatBodyRefs.current[chatId];
                if (chatBody) {
                    chatBody.scrollTo({
                        top: chatBody.scrollHeight,
                        behavior: "smooth",
                    });
                }
            }, 500);
        } catch (err) {
            console.error("Erro ao atualizar bloqueio", err);
        }
    };

    const handleCleanChat = async (chat, idOpt) => {
        try {
            if (cleanChats[chat.id]) {
                // Já limpo → deslimpar
                await api.delete(`/chat/${chat.id}/uncleanChat`);
                setCleanChats(prev => {
                    const copy = { ...prev };
                    delete copy[chat.id];
                    return copy;
                });
            } else {
                // Não está limpo → limpar
                await api.post(`/chat/${chat.id}/cleanChat`);
                setCleanChats(prev => ({ ...prev, [chat.id]: true }));
            }

        } catch (err) {
            console.error("Erro ao atualizar limpeza", err);
        } finally {
            if (cleanChats[chat.id]) {
                openChat(chat);
            } else {
                closeChat(chat.id);
            }
            setOpenMoreOptions(prev => ({ ...prev, [idOpt]: false }));
        }
    };

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
        if (open) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        // cleanup em caso de desmontagem do componente
        return () => document.body.classList.remove("no-scroll");
    }, [open]);

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

            ws.current.onmessage = async (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "message") {
                    const msg = data.message;
                    const chatId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

                    setChats(prev => {
                        const exists = prev.find(c => c.id === chatId);

                        let updated;
                        if (exists) {
                            updated = prev.map(c => {
                                if (c.id === chatId) {
                                    const existsMsgIndex = (c.messages || []).findIndex(m => m.id === msg.id);

                                    if (existsMsgIndex !== -1) {
                                        // Atualiza a mensagem existente
                                        const newMessages = [...c.messages];
                                        newMessages[existsMsgIndex] = msg;
                                        return { ...c, messages: newMessages };
                                    } else {
                                        // Adiciona a mensagem nova
                                        return { ...c, messages: [...(c.messages || []), msg] };
                                    }
                                }
                                return c;
                            });
                        } else {
                            fetchUserAndMessages(chatId, msg).then(({ userData, history }) => {
                                setChats(prevChats => {
                                    if (prevChats.find(c => c.id === chatId)) return prevChats;
                                    const newChat = {
                                        id: chatId,
                                        name: userData?.name || msg.sender_name || "Usuário",
                                        email: userData?.email || msg.sender_email || "",
                                        image: userData?.image || msg.sender_image || null,
                                        is_online: userData?.is_online ?? true,
                                        open: false,
                                        messages: history.length ? history : [msg]
                                    };
                                    const updatedChats = [newChat, ...prevChats];
                                    updateVisibleChats(updatedChats);

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

                if (data.type === "blocked") {
                    const { chatId, blocked } = data.payload;

                    setBlockChatsMsg(prev => {
                        if (blocked) {
                            return { ...prev, [chatId]: true };
                        } else {
                            const updated = { ...prev };
                            delete updated[chatId];
                            return updated;
                        }
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
                userData = {
                    name: msg.sender_name || "Usuário",
                    email: msg.sender_email || "E-mail",
                    image: msg.sender_image || null,
                    is_online: true
                };
            }

            return { userData, history };
        } catch {
            return { userData: { name: msg.sender_name || "Usuário", email: msg.sender_email || "E-mail", image: msg.sender_image || null, is_online: true }, history: [msg] };
        }
    };

    const openChat = async selectedUser => {
        try {
            const res = await api.get(`/messages/${selectedUser.id}?currentUserId=${user.id}`);
            const history = res.data;

            const resBlock = await api.get(`/chat/isBlocked/${selectedUser.id}`);
            const isBlocked = resBlock.data.blocked;
            setChats(prev => {

                try {
                    if (isBlocked) {
                        setBlockChatsMsg(prev => {
                            if (prev[selectedUser.id]) return prev;
                            return { ...prev, [selectedUser.id]: true };
                        });
                        blockChatsRef.current[selectedUser.id] = true;
                    } else {
                        blockChatsRef.current[selectedUser.id] = false;
                    }
                } catch (err) {
                    console.error("Erro ao verificar bloqueio:", err);
                }

                let updated = prev.map(c => {
                    if (c.open && c.id !== selectedUser.id) {
                        // minimiza o chat que estava aberto
                        attachmentRefs.current[c.id]?.current?.(); // reseta apenas deste chat
                        moreOptionsRefs.current[c.id]?.current?.();
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

                if (showDetalhesEnquete) {
                    setShowDetalhesEnquete(false);
                }
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

                    moreOptionsRefs.current[c.id]?.current?.(); // reset preview
                    if (openMoreOptions[c.id]) {
                        setOpenMoreOptions(prev => ({ ...prev, [`chat-${c.id}`]: false }));
                    }
                }
                // Alterna o estado do chat clicado
                return { ...c, open: !c.open };
            }

            if (c.open && c.id !== id) {
                // Chat que vai ser minimizado automaticamente
                attachmentRefs.current[c.id]?.current?.(); // reset preview
                if (openAttachment === c.id) setOpenAttachment(null);

                moreOptionsRefs.current[c.id]?.current?.(); // reset preview
                if (openMoreOptions[c.id]) {
                    setOpenMoreOptions(prev => ({ ...prev, [`chat-${c.id}`]: false }));
                }
                return { ...c, open: false };
            }

            return c;
        });

        updateVisibleChats(updated);

        if (showDetalhesEnquete) {
            setShowDetalhesEnquete(false);
        }

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
        }, 2500);
    };

    const handleSendMessage = chatId => {
        const text = inputs[chatId];
        if (!text?.trim()) return;

        if (blockChatsRef.current[chatId]) {
            setInputs(prev => ({ ...prev, [chatId]: "" }));
            return;
        }

        const message = {
            senderId: user.id,
            receiverId: chatId,
            content: text,
            msgType: "text",
            metadata: {}
        };

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "message", payload: message }));
        }

        setInputs(prev => ({ ...prev, [chatId]: "" }));
    };

    // --- Observer para marcar mensagens visíveis ---
    useEffect(() => {
        // desconecta antigos
        observersRef.current.forEach(o => o.disconnect());
        observersRef.current.clear();

        const currentObservers = new Map();

        visibleChats.forEach(c => {
            const chatWindow = document.querySelector(`.chat-window[data-chat-id="chat-${c.id}"]`);
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
    }, [scheduleFlush]);

    const handleEmojiSelect = (chatId, emoji) => {
        setInputs(prev => ({
            ...prev,
            [chatId]: (prev[chatId] || "") + emoji,
        }));
        setTimeout(() => {
            if (textareaRefs.current[chatId]) textareaRefs.current[chatId].focus();
        }, 0);
    };

    const sortedUsers = [...users].sort((a, b) => {
        const aPinned = fixedChats[a.id] ? 1 : 0;
        const bPinned = fixedChats[b.id] ? 1 : 0;
        return bPinned - aPinned;
    });

    const hasNonArchivedUsers = sortedUsers.some(u => u.id && !archivedChats[u.id] && u.id !== user.id);

    useEffect(() => {
        if (!hasNonArchivedUsers) {
            setSearchTerm("");
        }

        if (users.filter((u) => archivedChats[u.id]).length === 0) {
            setSearchTermArchived("");
        }
    }, [hasNonArchivedUsers, archivedChats, users])

    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const filteredUsers = sortedUsers
        .filter(u => u.id !== user.id)
        .filter(u => !archivedChats[u.id])
        .filter(u => normalize(u.name).includes(normalize(searchTerm)));

    const filteredUsersArchiveds = users
        .filter(u => archivedChats[u.id])
        .filter(u => normalize(u.name).includes(normalize(searchTermArchived)));

    return (
        <>
            <div className="chat-widget">
                {/* barra */}
                <div
                    className={`chat-bar ${users.some(u => archivedChats[u.id]) ? "ajuste" : "ajuste"}`}
                    onClick={() => {
                        setOpen(!open);
                    }}
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

                <div
                    ref={chatPanelRef}
                    className="chat-panel"
                    style={{
                        maxHeight: `${panelHeight}px`,
                        position: "relative",
                        overflowX: "hidden",
                        overflow: "visible"
                    }}>
                    {users.some(u => archivedChats[u.id]) && (
                        <div
                            className="buttonArquivo"
                            onClick={() => setShowArchived(true)}
                        >
                            <div>
                                <ArchiveRefreshedIcon />
                            </div>
                            <div className="labelArquivo" style={{ display: "flex", alignItems: "center" }}>
                                <span>Arquivadas</span>
                            </div>
                        </div>
                    )}
                    {hasNonArchivedUsers && (
                        <div style={{ position: "relative", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", }}>
                            <span className="search"><FaSearch /></span>
                            <input
                                key="usuarios"
                                type="text"
                                placeholder="Pesquisar usuários"
                                className="chat-search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                    <span className="chat-users-wrapper"></span>
                    <div
                        className={`archived-users chat-users-list ${(!hasNonArchivedUsers || (hasNonArchivedUsers && filteredUsers.length === 0)) && "body-usernot-arquivo"}`}>
                        {!hasNonArchivedUsers && (
                            <div style={{ padding: "1rem", color: "#888", textAlign: "center" }}>
                                Todas conversas arquivadas
                            </div>
                        )}

                        {hasNonArchivedUsers && filteredUsers.length === 0 ? (
                            <div style={{ padding: "1rem", color: "#888", textAlign: "center", marginTop: users && users.some(u => archivedChats[u.id]) ? "-65px" : "0", }}>
                                Nenhum usuário encontrado
                            </div>
                        ) : (
                            filteredUsers.map(u => {
                                const isPinned = fixedChats[u.id];
                                return (
                                    <div
                                        key={u.id}
                                        className={`chat-user ${!!openMoreOptions[`user-${u.id}`] && "active"}`}
                                        onClick={() => openChat(u)}
                                        style={{ zIndex: openMoreOptions[`user-${u.id}`] ? 1 : 0 }}
                                    >
                                        <span className={`icon-chevron-list ${!!openMoreOptions[`user-${u.id}`] && "active"}`} style={{ maxHeight: 350 }}>
                                            {/* <ArrowDropIcon size={20} color="#ccc" /> */}
                                            <MoreOptionChat
                                                iconBotao="ArrowDropIcon"
                                                resetRef={moreOptionsRefs.current[u.id] = moreOptionsRefs.current[u.id] || React.createRef()}
                                                chatName={u.name}
                                                chatId={`user-${u.id}`}
                                                dadosUsuario={{
                                                    type: "deslizar",
                                                    name: u.name,
                                                    email: u.email || "",
                                                    image: u.image || ""
                                                }}
                                                previewDados={previewDados[u.id]}
                                                setPreviewDados={(file) => setPreviewDados(prev => ({ ...prev, [u.id]: file }))}
                                                chatBodyRef={chatBodyRefs.current[u.id]}
                                                isOpenOptions={!!openMoreOptions[`user-${u.id}`]}
                                                onToggleOptions={(open) => {
                                                    setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: !!open }));
                                                }}
                                                onOptionSelect={(option) => {
                                                    switch (option) {
                                                        case "fechar":
                                                            closeChat(u.id);
                                                            break;
                                                        case "arquivar":
                                                            handleArchiveToggle(u.id);
                                                            setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: false }));
                                                            break;
                                                        case "fixar":
                                                            handleFixeToggle(u.id);
                                                            setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: false }));
                                                            break;
                                                        case "bloquear":
                                                            handleBlockToggle(u.id);
                                                            setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: false }));
                                                            break;
                                                        case "apagar":
                                                            handleCleanChat(u, `user-${u.id}`);
                                                            break;
                                                    }
                                                }}
                                                chatArquivado={{
                                                    [`user-${u.id}`]: archivedChats[u.id],
                                                }}
                                                chatFixado={{
                                                    [`user-${u.id}`]: fixedChats[u.id],
                                                }}
                                                chatBloqueado={{
                                                    [`user-${u.id}`]: blockChats[u.id],
                                                }}
                                                chatLimpo={{
                                                    [`user-${u.id}`]: cleanChats[u.id],
                                                }}
                                                fecharConversa={false}
                                            />
                                        </span>
                                        <span className="box-user-list">
                                            <span className={`status ${u.is_online ? "online" : "offline"}`} />
                                            <span
                                                className={`image ${typingStatus[u.id] ? "typing-effect" : ""}`}
                                                style={{ backgroundImage: `url(${getAvatar(u.image)})` }}
                                            />
                                            <span style={{ textAlign: "left", display: "flex", flexDirection: "column", paddingTop: 10 }}>
                                                <span>{u.name}</span>
                                                <div className="typing-label">{typingStatus[u.id] ? "escrevendo..." : "\u00A0"}</div>
                                                {isPinned && (
                                                    <span style={{ position: "absolute", bottom: 10, right: blockChats[u.id] ? 35 : 10 }}>
                                                        <PinRefreshedIcon size={20} color="#ccc" />
                                                    </span>
                                                )}
                                                {blockChats[u.id] && (
                                                    <span style={{ position: "absolute", bottom: 10, right: 10 }}>
                                                        <BlockRefreshedIcon size={20} color="#ccc" />
                                                    </span>
                                                )}
                                            </span>
                                            {unreadCounts[u.id] > 0 && (
                                                <span className="unread-badge">
                                                    <span>{unreadCounts[u.id]}</span>
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    {/* Painel lateral de arquivados */}
                    <div className={`archived-panel ${showArchived ? "open" : ""}`}>
                        <div className="archived-header">
                            <span>Conversas Arquivadas</span>
                            <button
                                className="close-archived"
                                onClick={() => setShowArchived(false)}
                            >
                                <ArrowIcon size={22} color="#333" direction="right" />
                            </button>
                        </div>
                        {users.filter((u) => archivedChats[u.id]).length > 0 && (
                            <div className="chat-panel"
                                style={{
                                    maxHeight: `${panelHeight}px`,
                                    position: "relative",
                                    overflowX: "hidden",
                                    overflow: "visible",
                                    borderTop: "none",
                                }}>
                                <span className="search"><FaSearch /></span>
                                <input
                                    key="arquivados"
                                    type="text"
                                    placeholder="Pesquisar arquivados"
                                    className="chat-search"
                                    value={searchTermArchived}
                                    onChange={(e) => setSearchTermArchived(e.target.value)}
                                />
                            </div>
                        )}
                        <div className={`archived-users chat-users-list ${(users.filter((u) => archivedChats[u.id]).length === 0 || filteredUsersArchiveds.length === 0) && "body-usernot-arquivo"}`}>
                            {users.filter((u) => archivedChats[u.id]).length === 0 && (
                                <div style={{ padding: "1rem", color: "#888", textAlign: "center" }}>
                                    Nenhuma conversa arquivada
                                </div>
                            )}

                            {(filteredUsersArchiveds.length === 0 && users.filter((u) => archivedChats[u.id]).length > 0) ? (
                                <div style={{ padding: "1rem", color: "#888", textAlign: "center", marginTop: "-65px", }}>
                                    Nenhum usuário encontrado
                                </div>
                            ) : (
                                filteredUsersArchiveds.map(u => {
                                    return (
                                        <div
                                            key={u.id}
                                            className={`chat-user ${!!openMoreOptions[`user-${u.id}`] && "active"}`}
                                            onClick={() => openChat(u)}
                                            style={{ zIndex: openMoreOptions[`user-${u.id}`] ? 1 : 0 }}
                                        >
                                            <span className={`icon-chevron-list ${!!openMoreOptions[`user-${u.id}`] && "active"}`}>
                                                {/* <ArrowDropIcon size={20} color="#ccc" /> */}
                                                <MoreOptionChat
                                                    iconBotao="ArrowDropIcon"
                                                    resetRef={moreOptionsRefs.current[u.id] = moreOptionsRefs.current[u.id] || React.createRef()}
                                                    chatName={u.name}
                                                    chatId={`user-${u.id}`}
                                                    dadosUsuario={{
                                                        type: "deslizar",
                                                        name: u.name,
                                                        email: u.email || "",
                                                        image: u.image || ""
                                                    }}
                                                    previewDados={previewDados[u.id]}
                                                    setPreviewDados={(file) => setPreviewDados(prev => ({ ...prev, [u.id]: file }))}
                                                    chatBodyRef={chatBodyRefs.current[u.id]}
                                                    isOpenOptions={!!openMoreOptions[`user-${u.id}`]}
                                                    onToggleOptions={(open) => {
                                                        setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: !!open }));
                                                    }}
                                                    onOptionSelect={(option) => {
                                                        switch (option) {
                                                            case "fechar":
                                                                closeChat(u.id);
                                                                break;
                                                            case "arquivar":
                                                                handleArchiveToggle(u.id);
                                                                setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: false }));
                                                                break;
                                                            case "fixar":
                                                                handleFixeToggle(u.id);
                                                                setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: false }));
                                                                break;
                                                            case "bloquear":
                                                                handleBlockToggle(u.id);
                                                                setOpenMoreOptions(prev => ({ ...prev, [`user-${u.id}`]: false }));
                                                                break;
                                                            case "apagar":
                                                                handleCleanChat(u, `user-${u.id}`);
                                                                break;
                                                        }
                                                    }}
                                                    chatArquivado={{
                                                        [`user-${u.id}`]: archivedChats[u.id],
                                                    }}
                                                    chatFixado={{
                                                        [`user-${u.id}`]: fixedChats[u.id],
                                                    }}
                                                    chatBloqueado={{
                                                        [`user-${u.id}`]: blockChats[u.id],
                                                    }}
                                                    chatLimpo={{
                                                        [`user-${u.id}`]: cleanChats[u.id],
                                                    }}
                                                    fecharConversa={false}
                                                />
                                            </span>
                                            <div className="box-user-list">
                                                <span
                                                    className="image"
                                                    style={{
                                                        backgroundImage: `url(${getAvatar(u.image)})`,
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        textAlign: "left",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        paddingTop: 10,
                                                    }}
                                                >
                                                    <span>{u.name}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="chat-windows">
                    {visibleChats.map(c => {
                        const userStatus = _chats.find(u => u.id === c.id);
                        return (
                            <div key={c.id} className={`chat-window ${c.open ? "open" : "closed"}`} data-chat-id={`chat-${c.id}`}>
                                <div className={`chat-header ${maximizarChat === c.id ? "max" : ""}`} onClick={(e) => { if (e.target.closest("button")) return; toggleChat(c.id); }}>
                                    <span className="image" style={{ backgroundImage: `url(${getAvatar(c.image)})` }} />
                                    <span>{c.name}</span>
                                    <span className={`status chat ${userStatus?.is_online ? "online" : "offline"}`} />
                                    {c.open && (
                                        <MoreOptionChat
                                            iconBotao="MoreRefreshed"
                                            resetRef={moreOptionsRefs.current[c.id] = moreOptionsRefs.current[c.id] || React.createRef()}
                                            chatName={c.name}
                                            chatId={`chat-${c.id}`}
                                            dadosUsuario={{
                                                type: "preview",
                                                name: c.name,
                                                email: c.email || "",
                                                image: c.image || ""
                                            }}
                                            previewDados={previewDados[c.id]}
                                            setPreviewDados={(file) => setPreviewDados(prev => ({ ...prev, [c.id]: file }))}
                                            chatBodyRef={chatBodyRefs.current[c.id]}
                                            isOpenOptions={!!openMoreOptions[`chat-${c.id}`]}
                                            onToggleOptions={(open) => {
                                                setOpenMoreOptions(prev => ({ ...prev, [`chat-${c.id}`]: !!open }));
                                            }}
                                            onOptionSelect={(option) => {
                                                switch (option) {
                                                    case "fechar":
                                                        closeChat(c.id);
                                                        break;
                                                    case "arquivar":
                                                        handleArchiveToggle(c.id);
                                                        setOpenMoreOptions(prev => ({ ...prev, [`chat-${c.id}`]: false }));
                                                        break;
                                                    case "fixar":
                                                        handleFixeToggle(c.id);
                                                        setOpenMoreOptions(prev => ({ ...prev, [`chat-${c.id}`]: false }));
                                                        break;
                                                    case "bloquear":
                                                        handleBlockToggle(c.id);
                                                        setOpenMoreOptions(prev => ({ ...prev, [`chat-${c.id}`]: false }));
                                                        break;
                                                    case "apagar":
                                                        handleCleanChat(c, `user-${c.id}`);
                                                        break;
                                                }
                                            }}
                                            chatArquivado={{
                                                [`chat-${c.id}`]: archivedChats[c.id],
                                            }}
                                            chatFixado={{
                                                [`chat-${c.id}`]: fixedChats[c.id],
                                            }}
                                            chatBloqueado={{
                                                [`chat-${c.id}`]: blockChats[c.id],
                                            }}
                                            chatLimpo={{
                                                [`chat-${c.id}`]: cleanChats[c.id],
                                            }}
                                            fecharConversa={true}
                                        />
                                    )}
                                    {c.open && (
                                        <button onClick={() => maxChat(c.id)}>
                                            {maximizarChat === c.id ? (
                                                <MinimizeSmallIcon size={20} color="#0A0A0A" />
                                            ) : (
                                                <MaximizeSmallIcon size={20} color="#0A0A0A" />
                                            )}

                                        </button>
                                    )}
                                    <button
                                        onClick={() => closeChat(c.id)}
                                        style={{ marginLeft: c.open ? undefined : "auto" }}
                                    >
                                        <CloseRoundedIcon size={24} color="#0A0A0A" />
                                    </button>
                                </div>

                                <div className={`chat-container ${maximizarChat === c.id ? "max" : ""}`}>
                                    <div className="background"></div>
                                    <div className="div-preview">
                                        <div
                                            className="chat-body"
                                            ref={el => (chatBodyRefs.current[c.id] = el)}
                                        >
                                            <div className="container-chat">
                                                {c.messages?.map((m, idx) => {
                                                    return (
                                                        <ChatMessage
                                                            key={idx}
                                                            message={m}
                                                            currentUser={user}
                                                            setShowDetalhesEnquete={setShowDetalhesEnquete}
                                                            setIdEnquete={setIdEnquete}
                                                            setShowDetalhesEvento={setShowDetalhesEvento}
                                                            setIdEvento={setIdEvento}
                                                            hideDropConfirma={hideDropConfirma}
                                                            setHideDropConfirma={setHideDropConfirma}
                                                            setOpenEvento={setOpenEvento}
                                                            setOpenEnquete={setOpenEnquete}
                                                            chatId={c.id}
                                                        />
                                                    );
                                                })}
                                                {/* Exibe apenas UMA vez no final */}
                                                {blockChats[c.id] && (
                                                    <div className="chat-message-row">
                                                        <span className="block-message me">Você bloqueou este usuário e não pode trocar mensagens</span>
                                                    </div>
                                                )}

                                                {blockChatsMsg[c.id] && (
                                                    <div className="chat-message-row">
                                                        <span className="block-message">Você foi bloqueado por este usuário e não pode trocar mensagens</span>
                                                    </div>
                                                )}
                                                {typingStatus[c.id] && (
                                                    <div className="chat-message-row other">
                                                        <div className="chat-message-bubble"><TypingIndicator /></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* ref={el => (chatBodyRefs.current[c.id] = el)} */}
                                    {!blockChats[c.id] && !blockChatsMsg[c.id] && (
                                        <div className="chat-footer">
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
                                                        if (payload) {
                                                            ws.current.send(JSON.stringify({
                                                                type: "message",
                                                                payload: {
                                                                    id: payload.id,
                                                                    senderId: user.id,
                                                                    receiverId: c.id,
                                                                    content: payload.content,
                                                                    msgType: payload.type,
                                                                    metadata: payload.metadata,
                                                                },
                                                            }));
                                                        }
                                                    }}
                                                    openEvento={openEvento}
                                                    setOpenEvento={setOpenEvento}
                                                    idEvento={idEvento}
                                                    setIdEvento={setIdEvento}
                                                    openEnquete={openEnquete}
                                                    setOpenEnquete={setOpenEnquete}
                                                    idEnquete={idEnquete}
                                                    setIdEnquete={setIdEnquete}
                                                />
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
                                                    <AudioRecorderBubble
                                                        chatId={c.id}
                                                        onToggleAttachment={(payload) => {
                                                            if (payload) {
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
                                                        max={`${maximizarChat === c.id ? "max" : ""}`}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <DetalhesEnquete
                                        showDetalhesEnquete={showDetalhesEnquete}
                                        setShowDetalhesEnquete={setShowDetalhesEnquete}
                                        idEnquete={idEnquete}
                                    />
                                    <DetalhesEvento
                                        showDetalhesEvento={showDetalhesEvento}
                                        setShowDetalhesEvento={setShowDetalhesEvento}
                                        idEvento={idEvento}
                                    />
                                </div>
                            </div>
                        )
                    }
                    )}
                </div>
            </div >
            {/* Overlay quando o chat está aberto */}
            {(open || (!open && visibleChats.some(c => c.open))) && (
                <div
                    className="chat-overlay"
                    onClick={() => {
                        setOpen(false);
                        setVisibleChats(prev => prev.map(c => ({ ...c, open: false })));
                    }}
                />
            )}
        </>
    );
}
