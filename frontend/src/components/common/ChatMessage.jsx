import React, { useState, useEffect, useRef, useCallback } from "react";
import MsgDoubleCheckIcon from "./icons/MsgDoubleCheckIcon";
import DocumentJPEIcon from "./icons/DocumentJPEIcon";
import ImageModal from "./ImageModal";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
const IMAGEM_PADRAO = `${API_URL}/images/news.png`;
import AudioMessageBubble from "./AudioMessageBubble";
import EnqueteButton from "./EnqueteButton";
import CheckCircleFilled from "./icons/CheckCircleFilled";
import MultiSelectIconFilled from "./icons/MultiSelectIconFilled";
import CalendarMonthIcon from './icons/CalendarMonthIcon';
import useAuth from "../../context/useAuth";
import EventoConfirma from "./EventoConfirma";
import { getTime } from "../../utils/helpers";
import MoreOptionMessage from "./MoreOptionMessage";
import api from "../../api/api";

export default function ChatMessage({ message, currentUser, setShowDetalhesEnquete, setIdEnquete, setShowDetalhesEvento, setIdEvento, hideDropConfirma, setHideDropConfirma, setOpenEvento, setOpenEnquete, chatId }) {
    const isOwn = message.sender_id === currentUser.id;
    const [selectedMedia, setSelectedMedia] = useState(null);
    const closeImageModal = () => setSelectedMedia(null);
    const openImageModal = (url, type) => setSelectedMedia({ url, type });
    const [totalGeral, setTotalGeral] = useState(0);
    const [votedRadio, setVotedRadio] = useState(0);
    const [participantes, setParticipantes] = useState(message.metadata.participantes || []);
    const [openConfirma, setOpenConfirma] = useState(false);
    const getAvatar = avatar => avatar ? `${API_URL}/uploads/${avatar}` : "/images/avatar.png";
    const { user } = useAuth();
    const [dropConfirmaId, setDropConfirmaId] = useState(null);
    const [onSelect, setOnSelect] = useState(null);
    const [openMoreOptions, setOpenMoreOptions] = useState({});
    const moreOptionsRefs = useRef({});
    const [mensagem, setMensagem] = useState("");
    const [error, setError] = useState("");
    const [openMensagem, setOpenMensagem] = useState(false);
    const ws = useRef(null);

    useEffect(() => {
        setParticipantes(message.metadata.participantes);
    }, [message.metadata.participantes]);

    useEffect(() => {
        setOpenConfirma(false)
    }, [hideDropConfirma]);

    const handleDetalhesEnquete = (id) => {
        setShowDetalhesEnquete(prev => !prev);
        setIdEnquete(id)
    };

    const handleDetalhesEvento = (id) => {
        setShowDetalhesEvento(prev => !prev);
        setIdEvento(id)
    };

    const handleEditarEvento = (id) => {
        setOpenEvento(prev => !prev);
        setIdEvento(id)
    };

    const handleEditarEnquete = (id) => {
        setOpenEnquete(prev => !prev);
        setIdEnquete(id);
    };

    const handleEditMessage = useCallback(async (id) => {

        console.log("Editar mensagem com ID:", id);

        if (id) {
            try {
                const res = await api.get(`/messages/msg/${id}`);
                const msgDados = res.data;
                setMensagem(msgDados.content);
                console.log(msgDados)
            } catch {
                setError("Erro ao buscar dados da mensagem.");
            }
        }
        setOpenMensagem(false);
    }, [
        setMensagem,
        setError,
        setOpenMensagem
    ]);

    useEffect(() => {
        const participante = message?.metadata?.participantes?.find(p => p.id === user.id);
        setOnSelect(participante?.opcao || null);
    }, [message, user.id]);

    return (
        <div
            className={`chat-message-row ${isOwn ? "own" : "other"} message-item`}
            data-message-id={message.id}
            data-receiver-id={message.receiver_id}
            data-read-at={message.read_at}
        >
            <div
                className={`chat-message-bubble ${message.type === "image" || message.type === "camera" || message.type === "video" || message.type === "file" ? "img" : (message.type === "text" || message.type === "audio" || message.type === "audioGrava" ? "" : "enquete")}`}
            >
                <span className={`icon-chevron-list-msg ${isOwn ? "own" : "other"} ${openMoreOptions[`msg-${message.id}`] ? "active" : ""}`}>
                    <MoreOptionMessage
                        iconBotao="ArrowDropIcon"
                        resetRef={moreOptionsRefs.current[message.id] = moreOptionsRefs.current[message.id] || React.createRef()}
                        msgId={`msg-${message.id}`}
                        dadosMensagem={{
                            type: "deslizar",
                            mensagem: message.content,
                            id: message.id,
                            created_at: message.created_at
                        }}
                        isOpenOptions={!!openMoreOptions[`msg-${message.id}`]}
                        onToggleOptions={(open) => {
                            setOpenMoreOptions(prev => ({ ...prev, [`msg-${message.id}`]: !!open }));
                        }}
                        editarMensagem={(open, payload) => {
                            if (payload) {
                                ws.current.send(JSON.stringify({
                                    type: "message",
                                    payload: {
                                        id: payload.id,
                                        senderId: user.id,
                                        receiverId: chatId,
                                        content: payload.content,
                                        msgType: payload.type,
                                        metadata: payload.metadata,
                                    },
                                }));
                            }
                        }}
                        setDirection={isOwn ? "own" : "other"}
                        setOpenMensagem={setOpenMensagem}
                        chatId={chatId}
                    />
                </span>

                {(message.type === "image" || message.type === "camera") ? (
                    <div className="container-img-sender">
                        <img
                            src={`${API_URL}/uploads/messages/${message.metadata.fileName}`}
                            alt="enviada"
                            className="img-preview"
                            onClick={() =>
                                openImageModal(`${API_URL}/uploads/messages/${message.metadata.fileName}`, "image")
                            }
                            onError={(e) => {
                                e.target.src = IMAGEM_PADRAO;
                            }}
                        />
                        {message.content !== "[uploaded file]" ? (
                            <span className="text-file">
                                {message.content}
                            </span>
                        ) : (
                            <div className="degradee"></div>
                        )}
                    </div>
                ) : message.type === "video" ? (
                    <div className="container-img-sender">
                        <video
                            autoPlay={false}
                            src={`${API_URL}/uploads/messages/${message.metadata.fileName}`}
                            style={{ maxWidth: "100%", borderRadius: 8, cursor: "zoom-in" }}
                            onClick={() =>
                                openImageModal(`${API_URL}/uploads/messages/${message.metadata.fileName}`, "video")
                            }
                            onError={(e) => {
                                e.currentTarget.src =
                                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23eee'/></svg>";
                            }}
                            controls={false}
                        />
                        {message.content !== "[uploaded file]" ? (
                            <span className="text-file">
                                {message.content}
                            </span>
                        ) : (
                            <div className="degradee"></div>
                        )}
                        <div className="degradee"></div>
                    </div>
                ) : message.type === "audio" || message.type === "audioGrava" ? (
                    <AudioMessageBubble
                        src={`/uploads/messages/${message.metadata.fileName}`}
                        time={message.created_at}
                        tipo={message.type}
                    />
                ) : message.type === "file" ? (
                    <>

                        <a
                            href={`/uploads/messages/${message.metadata.fileName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            // className="file-link"
                            style={{ display: "flex", gap: 8, textDecoration: "none", color: "#333", background: "rgba(194, 189, 184, .15)", padding: "10px", borderRadius: "8px 8px 3px 8px", lineHeight: "16px", }}
                            download
                        >
                            <DocumentJPEIcon
                                size={32}
                                color="#757778"
                                label={
                                    message.metadata.fileName
                                        ? message.metadata.fileName.split(".").pop().toUpperCase().slice(0, 3)
                                        : "FIL"
                                }
                            />
                            <span>
                                <div style={{ marginBottom: "5px" }}>
                                    {message.metadata.fileName}
                                </div>
                                <small style={{ color: "rgba(0, 0, 0, .6)", fontSize: "10px", }}>
                                    {message.metadata.fileName ? message.metadata.fileName.split(".").pop().toUpperCase() : "DOC"} - {message.metadata.fileSize}
                                </small>
                            </span>
                        </a>
                        {message.content !== "[uploaded file]" && (
                            <span className="text-file">
                                {message.content}
                            </span>
                        )}
                    </>
                ) : message.type === "enquete" ? (
                    <div style={{
                        paddingLeft: 20,
                        paddingRight: 20,
                        marginBottom: 40,
                    }}>
                        <div className="pergunta">{message.metadata.pergunta}</div>
                        <small className="instrucao">
                            {message.metadata.multiplos ? (
                                <MultiSelectIconFilled size={16} color="#576554" />
                            ) : (
                                <CheckCircleFilled size={16} color="#576554" />
                            )}
                            <span>
                                {message.metadata.multiplos ? 'Selecione uma ou mais opções' : 'Selecione uma opção'}
                            </span>
                        </small>
                        <ul className="listaRespostas">
                            {message.metadata.respostas.map((r) => (
                                <EnqueteButton
                                    key={r.index}
                                    index={r.index}
                                    enquete={message.id}
                                    text={r.text}
                                    totalGeral={totalGeral}
                                    setTotalGeral={setTotalGeral}
                                    multiplos={message.metadata.multiplos}
                                    votedRadio={votedRadio}
                                    setVotedRadio={setVotedRadio}
                                />
                            ))}
                        </ul>
                    </div>
                ) : message.type === "evento" ? (
                    <div style={{
                        marginLeft: 5,
                        marginRight: 5,
                        marginBottom: 0,
                        padding: 10,
                        paddingBottom: 30,
                        display: "flex",
                        borderRadius: 10,
                        justifyContent: "center",
                        alignContent: "center",
                        gap: 0,
                        background: "rgba(194, 189, 184, .15)",
                        minWidth: 284,
                        cursor: "pointer",
                    }}
                        onClick={() => handleDetalhesEvento(message.id)}
                    >
                        <div className="imgEvento">
                            <CalendarMonthIcon size={20} color={`${message.metadata.criador.id === user.id ? '#1DAA61' : '#333333'}`} />
                        </div>
                        <div style={{ paddingLeft: 10, }}>
                            <div className="pergunta">{message.metadata.titulo}</div>
                            <ul className="listaEvento">
                                <li>{message.metadata.dataInicio} às {message.metadata.horaInicio}</li>
                                <li>{message.metadata.local}</li>
                                <li>{message.metadata.link ? 'Ligação de vídeo do WhatsApp' : ''}</li>
                                <li>
                                    <div className="containerEventoInfo">
                                        {participantes
                                            .filter(p => p.opcao === "vou")
                                            .map((participante, index, array) => (
                                                <div
                                                    key={index}
                                                    className="image"
                                                    style={{
                                                        backgroundImage: `url(${getAvatar(participante.imagem)})`,
                                                        marginLeft: index > 0 ? "-13px" : "0px",
                                                        zIndex: array.length - index,
                                                        marginTop: 0,
                                                    }}
                                                />
                                            ))}

                                        <div className="presenca">Presença confirmada:</div>
                                        <div>{participantes.filter(p => p.opcao === "vou").length || 0}</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <span>{message.content}</span>
                )}
                {(!isOwn || isOwn) && (
                    <span className={`message-time ${isOwn ? "send" : ""} ${(message.type === "enquete" || message.type === "evento") && "bottom"}`}>
                        {getTime(message.created_at)}
                    </span>
                )}
                {isOwn && (
                    message.read_at ? (
                        <span className={`message-status lida ${(message.type === "enquete" || message.type === "evento") && "bottom"}`}>
                            <MsgDoubleCheckIcon size={16} color="#007BFC" />
                        </span>
                    ) : (
                        <span className={`message-status ${(message.type === "enquete" || message.type === "evento") && "bottom"}`}>
                            <MsgDoubleCheckIcon size={16} color={`${message.type === "image" && message.content === "[uploaded file]" ? "#fff" : "gray"}`} />
                        </span>
                    )
                )}
                {message.type === "enquete" && (
                    totalGeral === 0 ? (
                        <button className="showVotes" onClick={() => handleEditarEnquete(message.id)}>
                            Editar enquete
                        </button>
                    ) : (
                        <button
                            className="showVotes"
                            onClick={() => handleDetalhesEnquete(message.id)}
                        >
                            Mostrar votos
                        </button>
                    )
                )}
                {message.type === "evento" && (
                    message.metadata.criador.id === user.id ? (
                        <button
                            className="showVotes"
                            onClick={() => handleEditarEvento(message.id)}
                        >
                            Editar evento
                        </button>
                    ) : (
                        <EventoConfirma
                            mensagemId={message.id}
                            isOpen={openConfirma}
                            onToggle={(val) => setOpenConfirma(val)}
                            setOpenConfirma={setOpenConfirma}
                            onSelect={onSelect}
                            setOnSelect={setOnSelect}
                            hideDropConfirma={hideDropConfirma}
                            dropConfirmaId={dropConfirmaId}
                            setDropConfirmaId={setDropConfirmaId}
                            setParticipantes={setParticipantes}
                        />
                    )
                )}
            </div>
            <ImageModal
                show={!!selectedMedia}
                imageUrl={selectedMedia?.url}
                type={selectedMedia?.type}
                onClose={closeImageModal}
            />
        </div >
    );
}
