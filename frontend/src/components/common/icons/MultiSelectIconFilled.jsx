// MultiSelectIconFilled.jsx
import React from "react";

export default function MultiSelectIconFilled({ size = 19, color = "#0A1014" }) {
  return (
    <svg
      height={size * (12 / 19)} // mantém a proporção original (12 de altura p/ 19 de largura)
      width={size}
      viewBox="0 0 19 12"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>multi-select-icon-filled</title>
      <path
        fill={color}
        d="m12.3 6.9-1.08-1.07a.47.47 0 0 0-.35-.14.47.47 0 0 0-.34.14c-.1.09-.14.2-.14.35 0 .14.04.25.13.35l1.43 1.42a.48.48 0 0 0 .7 0l2.82-2.82c.1-.1.14-.21.14-.35a.47.47 0 0 0-.13-.35.47.47 0 0 0-.36-.14.47.47 0 0 0-.34.14zM13 11a4.87 4.87 0 0 1-3.54-1.46A5.05 5.05 0 0 1 8.4 4.05 5.05 5.05 0 0 1 13 1a4.87 4.87 0 0 1 3.54 1.46 5.05 5.05 0 0 1 1.07 5.49A5.05 5.05 0 0 1 13 11"
      />
      <path
        fill={color}
        d="M8.72 10.2A4.87 4.87 0 0 1 6 11a4.87 4.87 0 0 1-3.54-1.46A5.05 5.05 0 0 1 1.4 4.05 5.05 5.05 0 0 1 6 1a4.87 4.87 0 0 1 2.71.8 5.98 5.98 0 0 0-1.65 3.34L5.3 6.9 4.22 5.83a.47.47 0 0 0-.34-.14.47.47 0 0 0-.35.14c-.1.09-.14.2-.14.35 0 .14.04.25.13.35l1.43 1.42a.48.48 0 0 0 .7 0l1.38-1.38a5.93 5.93 0 0 0 1.69 3.63"
      />
    </svg>
  );
}
