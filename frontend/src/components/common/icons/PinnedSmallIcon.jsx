import React from "react";

const PinnedSmallIcon = ({ width = 15, height = 15, className = "", color = "currentColor" }) => (
    <svg
        viewBox="0 0 12 12"
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        className={className}
        fill="none"
    >
        <title>pinned-small</title>
        <path
            d="M7.79688 5.55L8.69688 6.45V7.35H6.44688V10.05L5.99688 10.5L5.54688 10.05V7.35H3.29688V6.45L4.19688 5.55V2.4H3.74688V1.5H8.24688V2.4H7.79688V5.55Z"
            fill={color}
        />
    </svg>
);

export default PinnedSmallIcon;
