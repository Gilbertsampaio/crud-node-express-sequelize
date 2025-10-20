import React from "react";

export default function AudioPauseIcon({ size = 34, color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 34 34"
      height={size}
      width={size}
      preserveAspectRatio="xMidYMid meet"
      version="1.1"
      x="0px"
      y="0px"
      enableBackground="new 0 0 34 34"
    >
      <title>audio-pause</title>
      <path
        fill={color}
        d="M9.2,25c0,0.5,0.4,1,0.9,1h3.6c0.5,0,0.9-0.4,0.9-1V9c0-0.5-0.4-0.9-0.9-0.9h-3.6
           C9.7,8,9.2,8.4,9.2,9V25z 
           M20.2,8c-0.5,0-1,0.4-1,0.9V25c0,0.5,0.4,1,1,1h3.6c0.5,0,1-0.4,1-1V9c0-0.5-0.4-0.9-1-0.9
           C23.8,8,20.2,8,20.2,8z"
      />
    </svg>
  );
}
