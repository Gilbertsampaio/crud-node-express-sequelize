import React, { useState, useRef, useEffect } from "react";
import MediaFilledRefreshed from "./icons/MediaFilledRefreshed";
import DocumentFilledRefreshed from "./icons/DocumentFilledRefreshed";
import CameraFilledRefreshed from "./icons/CameraFilledRefreshed";
import HeadphonesFilled from "./icons/HeadphonesFilled";
import PlusRoundedIcon from "./icons/PlusRoundedIcon";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import "./ChatAttachment.css";

export default function ChatAttachment({ isOpenAttachment, onToggleAttachment }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpenAttachment) return; // só adiciona se estiver aberto

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
    { label: "Documento", icon: DocumentFilledRefreshed, color: "#7F66FF" },
    { label: "Fotos e vídeos", icon: MediaFilledRefreshed, color: "#007BFC" },
    { label: "Câmera", icon: CameraFilledRefreshed, color: "#FF2E74" },
    { label: "Áudio", icon: HeadphonesFilled, color: "#FA6533" },
  ];

  return (
    <div className="chat-attachment" ref={wrapperRef}>
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

      {/* o dropdown sempre existe no DOM — apenas alternamos classes para animar */}
      <div
        className={`attachment-dropdown ${isOpenAttachment ? "open" : "closed"}`}
      >
        {options.map((opt, index) => {
          const Icon = opt.icon;
          return (
            <div
              key={index}
              className="attachment-option"
              onClick={() => {
                console.log(`Clicou em ${opt.label}`);
                onToggleAttachment(false);
              }}
            >
              <Icon size={26} color={opt.color} />
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
