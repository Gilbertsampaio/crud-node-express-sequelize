import React, { useState } from "react";
import MsgDoubleCheckIcon from "./icons/MsgDoubleCheckIcon";
import DocumentJPEIcon from "./icons/DocumentJPEIcon";
import ImageModal from "./ImageModal";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
const IMAGEM_PADRAO = "../../../public/images/news.png";

export default function ChatMessage({ message, currentUser/*, chatName*/ }) {
    const isOwn = message.sender_id === currentUser.id;
    const [selectedMedia, setSelectedMedia] = useState(null);
    const closeImageModal = () => setSelectedMedia(null);

    const openImageModal = (url, type) => setSelectedMedia({ url, type });

    return (
        <div
            className={`chat-message-row ${isOwn ? "own" : "other"} message-item`}
            data-message-id={message.id}
            data-receiver-id={message.receiver_id}
            data-read-at={message.read_at}
        >
            <div className={`chat-message-bubble ${message.type === "image" || message.type === "video" || message.type === "file" ? "img" : ""}`}>
                {/* {isOwn ? "Você" : chatName}: */}
                {message.type === "image" ? (
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
                ) : message.type === "audio" ? (
                    <div className="container-media-sender">
                        <audio controls src={`/uploads/messages/${message.metadata.fileName}`} />
                    </div>
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
                ) : (
                    <span>{message.content}</span>
                )}
                {isOwn && (
                    message.read_at ? (
                        <span className="message-status lida">
                            <MsgDoubleCheckIcon size={16} color="#007BFC" />
                        </span>
                    ) : (
                        <span className="message-status">
                            <MsgDoubleCheckIcon size={16} color={`${message.type === "image" && message.content === "[uploaded file]" ? "#fff" : "gray"}`} />
                        </span>
                    )
                )}
            </div>
            <ImageModal
                show={!!selectedMedia}
                imageUrl={selectedMedia?.url}
                type={selectedMedia?.type}
                onClose={closeImageModal}
            />
        </div>
    );
}
