import React, { useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import ExpressionsIcon from "./icons/ExpressionsIcon";
import "./EmojiDropdown.css";

export default function EmojiDropdown({ chatIdEmoji, onSelectEmoji, isOpenEmoji, onToggleEmoji }) {
  const wrapperRef = useRef(null);

  // Fechar se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onToggleEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggleEmoji]);

  // Seleção de emoji
  const handleEmojiSelect = (emoji) => {
    onSelectEmoji(chatIdEmoji, emoji.native);
    // onToggleEmoji(false);
  };

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <span
        className="options-footer options-emoji"
        onClick={() => onToggleEmoji(!isOpenEmoji)}
      >
        {isOpenEmoji ? (
          <ExpressionsIcon size={24} color="#0A0A0A" />
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
