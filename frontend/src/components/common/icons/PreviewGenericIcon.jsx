import React from "react";

export default function PreviewGenericIcon({ width = 88, height = 110, className = "" }) {
  return (
    <svg
      viewBox="0 0 88 110"
      height={height}
      width={width}
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <title>preview-generic</title>
      <g transform="translate(4 3)">
        <path
          strokeOpacity="0.08"
          stroke="#000"
          d="M3-.5h56.929a5.5 5.5 0 0 1 3.889 1.61l15.071 15.072a5.5 5.5 0 0 1 1.611 3.89V101a3.5 3.5 0 0 1-3.5 3.5H3A3.5 3.5 0 0 1-.5 101V3A3.5 3.5 0 0 1 3-.5z"
          fill="#FFF"
          fillRule="evenodd"
        />
      </g>
      <path
        d="M65.5 3.5v15a3 3 0 0 0 3 3h15"
        strokeOpacity="0.12"
        stroke="#000"
        fill="#FFF"
      />
    </svg>
  );
}
