import React from "react";

export default function DocumentJPEIcon({ size = 26, color = "currentColor", label = "JPG" }) {
    return (
        <span style={{position: "relative",}}>
            <svg
                viewBox="0 0 22 26"
                width={size}
                height={size}
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>document-JPE-icon</title>
                <path
                    fill={color}
                    d="M1 5.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C3.28 1 4.12 1 5.8 1h5.549c.978 0 1.468 0 1.928.11.408.099.798.26 1.156.48.404.247.75.593 1.441 1.285L17 4l2.125 2.125c.692.692 1.038 1.038 1.286 1.442a4 4 0 0 1 .479 1.156c.11.46.11.95.11 1.928V20.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 25 17.88 25 16.2 25H5.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C1 22.72 1 21.88 1 20.2V5.8Z"
                />
                <path
                    stroke="#fff"
                    strokeOpacity="0.15"
                    strokeWidth="0.5"
                    d="m21.133 8.665-.243.058.243-.058a4.25 4.25 0 0 0-.51-1.229c-.262-.429-.628-.794-1.294-1.46l-.027-.027-2.125-2.126-1.126-1.125-.027-.027c-.666-.666-1.031-1.032-1.46-1.295a4.251 4.251 0 0 0-1.229-.509C12.846.75 12.33.75 11.387.75H5.788c-.83 0-1.468 0-1.979.042-.515.042-.922.128-1.284.312a3.25 3.25 0 0 0-1.42 1.42c-.185.363-.271.77-.313 1.285C.75 4.32.75 4.96.75 5.79v14.423c0 .83 0 1.468.042 1.979.042.515.128.922.312 1.285a3.25 3.25 0 0 0 1.42 1.42c.363.184.77.27 1.285.312.51.042 1.15.042 1.98.042h10.423c.83 0 1.468 0 1.979-.042.515-.042.922-.128 1.285-.312a3.25 3.25 0 0 0 1.42-1.42c.184-.363.27-.77.312-1.285.042-.51.042-1.15.042-1.98V10.614c0-.942 0-1.459-.117-1.948Z"
                />
                <g filter="url(#a)">
                    <path
                        fill="#fff"
                        fillOpacity="0.4"
                        fillRule="evenodd"
                        d="m20.71 8.092-5.975-.026a1 1 0 0 1-.995-1.004l.025-5.81c.219.086.43.19.631.314.4.244.744.586 1.43 1.268L17 3.999l2.143 2.13c.701.696 1.052 1.044 1.302 1.452.101.164.19.335.266.511Z"
                        clipRule="evenodd"
                        shapeRendering="crispEdges"
                    />
                </g>
                <defs>
                    <filter
                        id="a"
                        width="7.97"
                        height="7.84"
                        x="13.239"
                        y="1.253"
                        colorInterpolationFilters="sRGB"
                        filterUnits="userSpaceOnUse"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                            in="SourceAlpha"
                            result="hardAlpha"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        />
                        <feOffset dy="0.5" />
                        <feGaussianBlur stdDeviation="0.25" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_491_191" />
                        <feBlend in="SourceGraphic" in2="effect1_dropShadow_491_191" result="shape" />
                    </filter>
                </defs>
            </svg>
            <div className="" style={{fontSize: "8px", width: "100%", textAlign: "center", fontWeight: "600", display: "block", position: "absolute", bottom: "40%", color: "#fff", }}>{label}</div>
        </span>
    );
}
