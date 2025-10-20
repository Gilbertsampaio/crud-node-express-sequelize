import React from "react";

export default function StickerCreateFilledRefreshed({ size = 24, color = "currentColor", className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      height={size}
      width={size}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      fill="none"
    >
      <title>sticker-create-filled-refreshed</title>
      <path
        opacity="0.9"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 21.6814C15.0541 21.3509 16.024 20.7715 16.8221 19.9799L19.8489 16.9776C20.8807 15.9542 21.5742 14.6537 21.8569 13.25H18C15.7909 13.25 14 15.0409 14 17.25V21.6814ZM12 22H9.27273C5.25611 22 2 18.7439 2 14.7273V9.27273C2 5.25611 5.25611 2 9.27273 2H14.7273C18.7439 2 22 5.25611 22 9.27273V11.25H18C14.6863 11.25 12 13.9363 12 17.25V22ZM9 5C8.44772 5 8 5.44772 8 6V8H6C5.44772 8 5 8.44772 5 9C5 9.55229 5.44772 10 6 10H8V12C8 12.5523 8.44772 13 9 13C9.55228 13 10 12.5523 10 12V10H12C12.5523 10 13 9.55228 13 9C13 8.44772 12.5523 8 12 8H10V6C10 5.44772 9.55228 5 9 5Z"
        fill={color}
      />
    </svg>
  );
}
