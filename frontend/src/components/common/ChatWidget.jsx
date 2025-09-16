import { useState, useEffect, useRef } from "react";
import api from "../../api/api";
import "./ChatWidget.css";
import {
    FaChevronUp,
    FaChevronDown,
    FaTimes,
    FaSearch,
    FaPaperclip,
    FaRegImage,
    FaRegSmile,
    FaPaperPlane,
} from "react-icons/fa";
import useAuth from "../../context/useAuth";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [_chats, setChats] = useState([]); // todos os chats
    const [visibleChats, setVisibleChats] = useState([]); // só 3 visíveis
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const chatPanelRef = useRef(null);
    const [panelHeight, setPanelHeight] = useState(0);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
    const avatarUrl = "/images/avatar.png";

    const fetchUsers = async () => {
        try {
            const resUsers = await api.get("/users/online");
            setUsers(resUsers.data);
        } catch (err) {
            console.error(err);
            setError("Erro ao buscar usuários.");
        }
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (open && chatPanelRef.current) {
            setPanelHeight(chatPanelRef.current.scrollHeight);
        } else {
            setPanelHeight(0);
        }
    }, [open]);

    const getAvatar = (avatar) =>
        avatar ? `${API_URL}/uploads/${avatar}` : avatarUrl;

    const updateVisibleChats = (list) => {
        // pega sempre os 3 primeiros (à esquerda)
        setVisibleChats(list.slice(0, 3));
    };

    const openChat = (selectedUser) => {
        setChats((prev) => {
            const exists = prev.find((c) => c.id === selectedUser.id);
            let updated;

            if (exists) {
                // já existe → abre este e minimiza os outros
                updated = prev.map((c) =>
                    c.id === selectedUser.id ? { ...c, open: true } : { ...c, open: false }
                );
            } else {
                // novo → adiciona na esquerda e minimiza os outros
                updated = [
                    { ...selectedUser, open: true },
                    ...prev.map((c) => ({ ...c, open: false })),
                ];
            }

            updateVisibleChats(updated);
            return updated;
        });
    };

    const toggleChat = (id) => {
        setChats((prev) => {
            const updated = prev.map((c) =>
                c.id === id ? { ...c, open: !c.open } : { ...c, open: false }
            );
            updateVisibleChats(updated);
            return updated;
        });
    };

    const closeChat = (id) => {
        setChats((prev) => {
            // remove o chat
            const updated = prev.filter((c) => c.id !== id);
            updateVisibleChats(updated);
            return updated;
        });
    };

    const handleSendMessage = () => {
        console.log("Mensagem enviada!");
    };

    return (
        <div className="chat-widget">
            {/* Barra principal */}
            <div className="chat-bar" onClick={() => setOpen(!open)}>
                <span
                    className="image"
                    style={{
                        backgroundImage: `url(${getAvatar(user?.image)})`,
                    }}
                ></span>
                <span className="chat-bar-text">Mensagens</span>
                {open ? <FaChevronDown /> : <FaChevronUp />}
            </div>

            {/* Painel de usuários */}
            <div
                ref={chatPanelRef}
                className="chat-panel"
                style={{ maxHeight: `${panelHeight}px` }}
            >
                <span className="search">
                    <FaSearch />
                </span>
                <input
                    type="text"
                    placeholder="Pesquisar mensagens"
                    className="chat-search"
                />
                <div className="chat-users-list">
                    {error ? (
                        <div>{error}</div>
                    ) : (
                        users.map((u) => (
                            <div
                                key={u.id}
                                className="chat-user"
                                onClick={() => openChat(u)}
                            >
                                <span
                                    className="image"
                                    style={{
                                        backgroundImage: `url(${getAvatar(u.image)})`,
                                    }}
                                ></span>
                                <span>{u.name}</span>
                                <span
                                    className={`status ${
                                        u.is_online ? "online" : "offline"
                                    }`}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Janelas de chat abertas */}
            <div className="chat-windows">
                {visibleChats.map((c) => (
                    <div
                        key={c.id}
                        className={`chat-window ${c.open ? "open" : "closed"}`}
                    >
                        <div
                            className="chat-header"
                            onClick={(e) => {
                                if (e.target.closest("button")) return;
                                toggleChat(c.id);
                            }}
                        >
                            <span
                                className="image"
                                style={{ backgroundImage: `url(${getAvatar(c.image)})` }}
                            ></span>
                            <span>{c.name}</span>
                            <span
                                className={`status ${
                                    c.is_online ? "online" : "offline"
                                }`}
                            />
                            <button onClick={() => closeChat(c.id)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="chat-container">
                            <div className="chat-body">
                                <p>
                                    <b>{c.name}</b>: Olá 👋
                                </p>
                            </div>
                            <div className="chat-footer">
                                <textarea
                                    placeholder="Digite sua mensagem..."
                                    className="chat-message"
                                    rows={3}
                                ></textarea>
                                <div className="chat-options">
                                    <div className="options-left">
                                        <button><FaRegImage /></button>
                                        <button><FaPaperclip /></button>
                                        <button><FaRegSmile /></button>
                                    </div>
                                    <button
                                        className="send-button"
                                        onClick={handleSendMessage}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
