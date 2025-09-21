import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import MediaFilledRefreshed from "./icons/MediaFilledRefreshed";
import VideoCallRefreshed from "./icons/VideoCallRefreshed";
import DocumentFilledRefreshed from "./icons/DocumentFilledRefreshed";
import CameraFilledRefreshed from "./icons/CameraFilledRefreshed";
import HeadphonesFilled from "./icons/HeadphonesFilled";
import PlusRoundedIcon from "./icons/PlusRoundedIcon";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import SendFilledIcon from "./icons/SendFilledIcon";
import PreviewGenericIcon from "./icons/PreviewGenericIcon";
import AlertModal from "./AlertModal";
import EmojiDropdown from "./EmojiDropdown";

// import api from '../../api/api';
import "./ChatAttachment.css";

export default function ChatAttachment({ chatId, isOpenAttachment, onToggleAttachment, previewFile, setPreviewFile, resetRef }) {
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  // const [previewFile, setPreviewFile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL_BACKEND || "http://localhost:3000";
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const textareaRefs = useRef({});
  const [inputs, setInputs] = useState({});
  const [openEmoji, setOpenEmoji] = useState(null);

  const resetarInput = React.useCallback(() => {
    // setSelectedOption(null);
    setPreviewFile(null);
    setInputs(prev => ({ ...prev, [chatId]: "" }));
    if (fileInputRef.current) fileInputRef.current.value = null;
  }, [setPreviewFile, chatId]);

  useEffect(() => {
    if (resetRef) resetRef.current = resetarInput;
  }, [resetRef, resetarInput]);

  useEffect(() => {
    if (previewFile) {
      // espera o portal renderizar
      requestAnimationFrame(() => {
        const textarea = textareaRefs.current[chatId];
        if (textarea) textarea.focus();
      });
    }
  }, [previewFile, chatId]);

  useEffect(() => {
    if (!isOpenAttachment) return;

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onToggleAttachment(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenAttachment, onToggleAttachment]);

  const options = [
    {
      label: "Documento",
      icon: DocumentFilledRefreshed,
      color: "#7F66FF",
      onClick: () => chamaFuncao("file"),
    },
    {
      label: "Fotos",
      icon: MediaFilledRefreshed,
      color: "#007BFC",
      onClick: () => chamaFuncao("image"),
    },
    {
      label: "Vídeos",
      icon: VideoCallRefreshed,
      color: "#ffcc00",
      onClick: () => chamaFuncao("video"),
    },
    { label: "Câmera", icon: CameraFilledRefreshed, color: "#FF2E74" },
    { label: "Áudio", icon: HeadphonesFilled, color: "#FA6533" },
  ];

  function chamaFuncao(optionLabel) {
    setSelectedOption(optionLabel);
    fileInputRef.current.click()
    setTimeout(function () {
      onToggleAttachment(false);
    }, 500)
  }

  const handleFileChange = (e) => {
    onToggleAttachment(false);

    const file = e.target.files[0];
    if (!file) return;

    // validações
    const maxSizeMB = 10; // limite de 10MB
    if (file.size > maxSizeMB * 1024 * 1024) {
      setAlertMessage(`Arquivo muito grande! Máx: ${maxSizeMB}MB`);
      setShowAlert(true)
      return;
    }

    // const allowedTypes = ["image/", "application/pdf", "audio/", "video/"];
    // if (!allowedTypes.some((t) => file.type.startsWith(t))) {
    //   setAlertMessage("Tipo de arquivo não permitido!");
    //   setShowAlert(true)
    //   return;
    // }

    // cria previewUrl para qualquer tipo que terá preview
    if (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf") {
      file.previewUrl = URL.createObjectURL(file);
    }

    setPreviewFile(file);
  };

  const handleSendFile = async () => {
    if (!previewFile) return;

    const formData = new FormData();
    const text = inputs[chatId];
    formData.append("file", previewFile);

    try {
      const res = await fetch(`${API_URL}/api/uploads/message`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      const message = {
        type: selectedOption,
        metadata: {
          fileName: data.fileName,
          fileSize: data.fileSize
        },
      };

      if (text && text.trim() !== "") {
        message.content = text.trim();
      } else {
        message.content = "[uploaded file]"
      }

      onToggleAttachment(false, message);
    } catch (err) {
      console.error("Erro no upload:", err);
    } finally {
      if (previewFile?.previewUrl) {
        URL.revokeObjectURL(previewFile.previewUrl);
      }
      resetarInput();
    }
  };

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }

  const handleEmojiSelect = (chatId, emoji) => {
    setInputs(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || "") + emoji,
    }));
    setTimeout(() => {
      if (textareaRefs.current[chatId]) textareaRefs.current[chatId].focus();
    }, 0);
  };

  const previewModal = previewFile && (
    <div className="preview-modal">
      <div className={`preview-content ${!previewFile?.type?.startsWith("image/") && "video"}`}>

        {selectedOption === "image" && (
          <img
            src={previewFile.previewUrl}
            alt={previewFile.name}
            style={{ maxWidth: "100%", marginBottom: 0 }}
          />
        )}

        {selectedOption === "video" && (
          <video
            controls
            // autoPlay
            src={previewFile.previewUrl} // agora previewUrl existe para vídeo
            alt={previewFile.name}
            style={{ maxWidth: "100%", marginBottom: 0 }}
          />
        )}

        {selectedOption === "file" && (
          <div className="container-file-preview">
            <div style={{ marginBottom: 20 }}>
              <PreviewGenericIcon />
            </div>
            <div style={{
              marginBottom: 10,
              marginTop: 10,
              fontSize: "1.5rem",
              color: "#aebac1"
            }}>Prévia indisponível</div>
            <div style={{ fontSize: "1rem", color: "rgb(174, 186, 193)" }}>
              {previewFile && `${formatFileSize(previewFile.size)} - ${previewFile.name.split('.').pop().toUpperCase()}`}
            </div>
          </div>
        )}

        <div className="preview-actions">
          <button
            type="button"
            className={`options-footer options-file`}
            onClick={() => resetarInput()}
          >
            <div className="icon-container">
              <CloseRoundedIcon size={24} color="#0A0A0A" />
            </div>
          </button>
          <textarea
            ref={el => (textareaRefs.current[chatId] = el)}
            placeholder="Digite sua mensagem..."
            className="chat-message-preview"
            value={inputs[chatId] || ""}
            onChange={e => setInputs(prev => ({ ...prev, [chatId]: e.target.value }))}
          />
          <span className="options-footer-emoji-preview">
            <EmojiDropdown
              chatIdEmoji={chatId}
              isOpenEmoji={openEmoji === chatId}
              onToggleEmoji={(open) => setOpenEmoji(open ? chatId : null)}
              onSelectEmoji={handleEmojiSelect}
            />
          </span>
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

  return (
    <div className="chat-attachment" ref={wrapperRef}>
      {!previewFile ? (
        <button
          type="button"
          aria-expanded={isOpenAttachment}
          className={`options-footer options-file ${isOpenAttachment ? "active" : ""}`}
          onClick={() => onToggleAttachment(!isOpenAttachment)}
        >
          <div className="icon-container">
            <PlusRoundedIcon size={24} color="#0A0A0A" />
            <CloseRoundedIcon size={24} color="#0A0A0A" />
          </div>
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={isOpenAttachment}
          className={`options-footer options-file ${isOpenAttachment ? "active" : ""}`}
          disabled
        >
          <div className="icon-container">
            <PlusRoundedIcon size={24} color="#d5d5d5" />
          </div>
        </button>
      )}

      <div className={`attachment-dropdown ${isOpenAttachment ? "open" : "closed"}`}>
        {options.map((opt, index) => {
          const Icon = opt.icon;
          return (
            <div
              key={index}
              className="attachment-option"
              onClick={opt.onClick || (() => onToggleAttachment(false))}
            >
              <Icon size={26} color={opt.color} />
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <AlertModal
        show={showAlert}
        title="Atenção"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      {/* Renderiza preview no body */}
      {/* {previewFile && createPortal(previewModal, document.querySelector(".div-preview"))} */}
      {/* {previewFile && createPortal(previewModal, document.querySelector(`.chat-window[data-chat-id="${chatId}"] .div-preview`))} */}
      {previewFile && (() => {
        const container = document.querySelector(`.chat-window[data-chat-id="${chatId}"] .div-preview`);
        if (container) return createPortal(previewModal, container);
        return null;
      })()}
    </div>
  );
}
