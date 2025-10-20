import React from "react";

export default function ChevronIcon({ size = 18, color = "currentColor", className = "" }) {
    return (
        <svg
            viewBox="0 0 30 30"
            height={size}
            preserveAspectRatio="xMidYMid meet"
            className={className}
            x="0px"
            y="0px"
            style={{ transform: "rotate(90deg)" }}
        >
            <title>chevron</title>
            <path
                fill={color}
                d="M11,21.212L17.35,15L11,8.65l1.932-1.932L21.215,15l-8.282,8.282L11,21.212z"
            />
        </svg>
    );
}
