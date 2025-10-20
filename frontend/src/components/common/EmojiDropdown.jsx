import React, { useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import ExpressionsIcon from "./icons/ExpressionsIcon";
import IcMood from "./icons/IcMood";

import "./EmojiDropdown.css";

export default function EmojiDropdown({ icon = false, chatIdEmoji, onSelectEmoji, isOpenEmoji, onToggleEmoji, numberOption }) {
  const wrapperRef = useRef(null);

  // Fechar se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (event.target.closest('.emoji-dropdown-wrapper')) return;
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onToggleEmoji(false); // fecha
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggleEmoji]);

  // Seleção de emoji
  const handleEmojiSelect = (emoji) => {
    onSelectEmoji(chatIdEmoji, emoji.native, numberOption);
    // onToggleEmoji(false);
  };

  return (
    <div style={{ position: "relative" }} ref={wrapperRef} className="emoji-dropdown-wrapper"
      onClick={(e) => e.stopPropagation()}>
      <span
        className="options-footer options-emoji"
        onClick={(e) => {
          e.stopPropagation(); // previne que o click suba
          onToggleEmoji(!isOpenEmoji); // toggle apenas pelo clique
        }}
      >
        {icon ? (
          <IcMood size={24} color="#0A0A0A" />
        ) : (
          <ExpressionsIcon size={24} color="#0A0A0A" />
        )}
      </span>

      <div
        className={`emoji-dropdown ${isOpenEmoji ? "open" : "closed"}`}
      >
        <Picker
          data={data}
          onEmojiSelect={handleEmojiSelect}
          theme="light"
          locale="pt"
          previewPosition="none"
          searchPosition="bottom"
          perLine={10}
        />
      </div>
    </div>
  );
}
