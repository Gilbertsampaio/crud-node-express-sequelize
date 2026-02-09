import React, { useState, useEffect, useRef, useCallback } from "react";
import MsgDoubleCheckIcon from "./icons/MsgDoubleCheckIcon";
import DocumentJPEIcon from "./icons/DocumentJPEIcon";
import ImageModal from "./ImageModal";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
const IMAGEM_PADRAO = `${API_URL}/images/news.png`;
import AudioMessageBubble from "./AudioMessageBubble";
import VideoMessageBubble from "./VideoMessageBubble";
import EnqueteButton from "./EnqueteButton";
import CheckCircleFilled from "./icons/CheckCircleFilled";
import MultiSelectIconFilled from "./icons/MultiSelectIconFilled";
import CalendarMonthIcon from './icons/CalendarMonthIcon';
import useAuth from "../../context/useAuth";
import EventoConfirma from "./EventoConfirma";
import { getTime, formatarDataPersonalizada } from "../../utils/helpers";
import MoreOptionMessage from "./MoreOptionMessage";
import PinnedSmallIcon from "./icons/PinnedSmallIcon";
import DocumentRefreshedThin from "./icons/DocumentRefreshedThin";
import KeyboardVoiceFilled from "./icons/KeyboardVoiceFilled";
import PollRefreshedThin from "./icons/PollRefreshedThin";
import ChatListEvent from "./icons/ChatListEvent";
import ImageRefreshed from "./icons/ImageRefreshed";
import VideoCallRefreshed from "./icons/VideoCallRefreshed";
import MessageReplyPreview from "./MessageReplyPreview";

export default function ChatMessage({ message, currentUser, setShowDetalhesEnquete, setIdEnquete, setShowDetalhesEvento, setIdEvento, hideDropConfirma, setHideDropConfirma, setOpenEvento, setOpenEnquete, chatId, editarMensagem, apagarMensagem, fixarMensagem, isFixed, setResponderMsg, nomeChat }) {
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

    useEffect(() => {
        setParticipantes(message.metadata.participantes);
    }, [message.metadata.participantes]);

    useEffect(() => {
        if (message.isDeletedNotice) {
            console.log(message)
        }
    }, [message]);

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

    useEffect(() => {
        const participante = message?.metadata?.participantes?.find(p => p.id === user.id);
        setOnSelect(participante?.opcao || null);
    }, [message, user.id]);

    // const MEDIA_TYPES = ["image", "camera", "video", "file", "audio", "audioGrava", "enquete", "evento"];
    // const iconByType = {
    //         file: DocumentRefreshedThin,
    //         video: VideoCallRefreshed,
    //         image: ImageRefreshed,
    //         camera: ImageRefreshed,
    //         audio: KeyboardVoiceFilled,
    //         audioGrava: KeyboardVoiceFilled,
    //         enquete: PollRefreshedThin,
    //         evento: ChatListEvent
    //     };

    // const getLabelByType = (type, currentTime = null) => {
    //     if (type === "video") return currentTime + " Vídeo";
    //     if (type === "file") return "Arquivo";
    //     if (type === "audio" || type === "audioGrava") return currentTime;
    //     return "Foto";
    // };

    // const isMedia = MEDIA_TYPES.includes(message?.metadata?.replyTo?.type);
    // const Icon = iconByType[message?.metadata?.replyTo?.type];
    // const iconColor = message?.metadata?.replyTo?.type === "audio" || message?.metadata?.replyTo?.type === "audioGrava"
    //                         ? "#1DAA61"
    //                         : "#00000099";

    return (
        <div
            className={`chat-message-row ${isOwn ? "own" : "other"} message-item`}
            data-message-id={message.id}
            data-receiver-id={message.receiver_id}
            data-read-at={message.read_at}
            id={`message-${message.id}`}
            style={{ padding: "0px 10px 0px 10px"}}
        >
            <div
                className={`chat-message-bubble ${message.type === "image" || message.type === "camera" || message.type === "video" || message.type === "file" ? "img" : (message.type === "system" || message.type === "text" || message.type === "audio" || message.type === "audioGrava" ? "" : "enquete")} ${message.type === "system" ? "delete" : ""}`}
            >
                {message.type !== "system" && (
                    <span className={`icon-chevron-list-msg ${isOwn ? "own" : "other"} ${openMoreOptions[`msg-${message.id}`] ? "active" : ""}`}>
                        <MoreOptionMessage
                            iconBotao="ArrowDropIcon"
                            resetRef={moreOptionsRefs.current[message.id] = moreOptionsRefs.current[message.id] || React.createRef()}
                            msgId={message.id}
                            dadosMensagem={{
                                type: message.type,
                                sender_id: message.sender_id,
                                receiver_id: message.receiver_id,
                                mensagem: message.content,
                                metadata: message.metadata,
                                id: message.id,
                                created_at: getTime(message.created_at),
                                read_at: message.read_at,
                                autor: message.sender_id === user.id ? true : false,
                            }}
                            isOpenOptions={!!openMoreOptions[`msg-${message.id}`]}
                            onToggleOptions={(open) => {
                                setOpenMoreOptions(prev => ({ ...prev, [`msg-${message.id}`]: !!open }));
                            }}
                            editarMensagem={editarMensagem}
                            setDirection={isOwn ? "own" : "other"}
                            setOpenMensagem={setOpenMensagem}
                            chatId={chatId}
                            apagarMensagem={apagarMensagem}
                            userId={user.id}
                            fixarMensagem={fixarMensagem}
                            isFixed={isFixed}
                            setResponderMsg={setResponderMsg}
                        />
                    </span>
                )}

                {/* {message.metadata.replyTo && (
                    <div className="resposta" style={{ marginTop: 0, marginBottom: 10, borderRadius: 5}} key={message.id}>
                        <div className="labelAutor" style={{ marginBottom: 4}}>
                            {user.id !== message.metadata.replyTo.sender_id ? message.metadata.replyTo.name : "Você"}
                        </div>
                        <div className="textoResposta" style={{ marginRight: isMedia && (message.metadata.replyTo.type === "video" || message.metadata.replyTo.type === "camera" || message.metadata.replyTo.type === "image") ? 70 : 0 }}>
                            {isMedia && Icon && (
                                <span style={{ marginBottom: 0, display: "inherit"}} aria-hidden="true" data-icon={`${message.metadata.replyTo.type}-refreshed`}>
                                    <Icon size={24} color={iconColor} />
                                </span>
                            )}
                            {message.metadata.replyTo.content === "[enquete]" ? (
                                <span className="mensagem-resposta">
                                    {message.metadata.replyTo.metadata?.pergunta}
                                </span>
                            ) : message.metadata.replyTo.content === "[evento]" ? (
                                <span className="mensagem-resposta">
                                    {message.metadata.replyTo.metadata?.titulo} • {formatarDataPersonalizada(`${message.metadata.replyTo.metadata.dataInicio}T${message.metadata.replyTo.metadata.horaInicio}:00`)}
                                </span>
                            ) : message.metadata.replyTo.content !== "[uploaded file]" && message.metadata.replyTo.content !== "[uploaded audio]" ? (
                                <span className="mensagem-resposta">
                                    {message.metadata.replyTo.content.length > 40
                                        ? `${message.metadata.replyTo.content.substring(0, 40)}...`
                                        : message.metadata.replyTo.content}
                                </span>
                            ) : (
                                <span className="mensagem-resposta">
                                    {getLabelByType(message.metadata.replyTo.type, message.metadata.replyTo.currentTime)}
                                </span>
                            )}
                        </div>

                        {isMedia && (
                            <span className="box-imagem-preview-resposta" style={{ right: 0 }}>
                                {message.metadata.replyTo.type === "video" && (
                                    <video
                                        src={`${API_URL}/uploads/messages/${message.metadata.replyTo.metadata.fileName}`}
                                        className="img-preview-resposta msgR"
                                        style={{ maxWidth: "100%", cursor: "zoom-in",  }}
                                        controls={false}
                                    />
                                )}
                                
                                {(message.metadata.replyTo.type === "image" || message.metadata.replyTo.type === "camera") && (
                                    <img
                                        src={`${API_URL}/uploads/messages/${message.metadata.replyTo.metadata.fileName}`}
                                        alt="respondida"
                                        className="img-preview-resposta msgR"
                                    />
                                )}
                            </span>
                        )}
                    </div>
                )} */}

                <MessageReplyPreview
                    replyTo={message.metadata.replyTo}
                    userId={user.id}
                    API_URL={API_URL}
                    isPreview={false}
                    nomeChat={nomeChat}
                />

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
                        <VideoMessageBubble
                            src={`${API_URL}/uploads/messages/${message.metadata.fileName}`}
                            onClick={() => openImageModal(`${API_URL}/uploads/messages/${message.metadata.fileName}`, "video")}
                            onTimeUpdate={(time) => {
                                setResponderMsg(prev =>
                                    prev.map(m =>
                                        m.id === message.id ? { ...m, currentTime: time } : m
                                    )
                                );
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
                ) : message.type === "audio" || message.type === "audioGrava" ? (
                    <AudioMessageBubble
                        src={`/uploads/messages/${message.metadata.fileName}`}
                        time={message.created_at}
                        tipo={message.type}
                        onTimeUpdate={(time) => {
                            setResponderMsg(prev =>
                                prev.map(m =>
                                    m.id === message.id
                                        ? { ...m, currentTime: time }
                                        : m
                                )
                            );
                        }}
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
                                <li>{formatarDataPersonalizada(`${message.metadata.dataInicio}T${message.metadata.horaInicio}:00`)}</li>
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

                ) : message.type === "system" ? (
                    <span>
                        <em>{message.content}</em>
                    </span>
                ) : (
                    <span style={{marginRight: 20}}>{message.content}</span>
                )}
                {((!isOwn || isOwn) && !message.isDeletedNotice) && (
                    <span className={`message-time ${isOwn ? "send" : "receive"} ${(message.type === "enquete" || message.type === "evento") ? "bottom" : ""} ${(message.type === "image" || message.type === "camera" || message.type === "video" || message.type === "file")  ? "fileFixed" : ""} ${ message.content === "[uploaded file]" && message.type !== "file" && message.type !== "audio" ? "noText" : "" }`}>
                        {getTime(message.created_at)}
                    </span>
                )}
                {isFixed && (
                    <span className={`message-fixed ${isOwn ? "send" : ""} ${(message.type === "enquete" || message.type === "evento") ? "bottom" : ""}`}>
                        <PinnedSmallIcon size={16} color="gray" />
                    </span>
                )}
                {(isOwn && !message.isDeletedNotice) && (
                    message.read_at ? (
                        <span className={`message-status lida ${(message.type === "enquete" || message.type === "evento") ? "bottom" : ""}`}>
                            <MsgDoubleCheckIcon size={16} color="#007BFC" />
                        </span>
                    ) : (
                        <span className={`message-status ${(message.type === "enquete" || message.type === "evento") ? "bottom" : ""} ${ message.content === "[uploaded file]" ? "noText" : "" }`}>
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
