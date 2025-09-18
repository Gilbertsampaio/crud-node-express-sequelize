import React from "react";

export default function CloseRoundedIcon({ size = 24, color = "#000000" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            width={size}
            viewBox="0 0 24 24"
            fill={color}
        >
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7a.996.996 0 1 0-1.41 1.41L10.59 12l-4.9 4.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.9c.39.39 1.02.39 1.41 0a.996.996 0 0 0 0-1.41L13.41 12l4.89-4.89c.39-.39.39-1.02 0-1.4Z" />
        </svg>
    );
}
