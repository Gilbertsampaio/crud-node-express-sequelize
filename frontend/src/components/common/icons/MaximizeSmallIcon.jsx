import React from "react";

export default function MaximizeSmallIcon({ size = 24, color = "#000000" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            width={size}
            viewBox="0 0 24 24"
            fill={color}
        >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path id="primary" d="M10,4H5.41l5.3,5.29a1,1,0,0,1,0,1.42,1,1,0,0,1-1.42,0L4,5.41V10a1,1,0,0,1-2,0V4A2,2,0,0,1,4,2h6a1,1,0,0,1,0,2Zm11,9a1,1,0,0,0-1,1v4.59l-5.29-5.3a1,1,0,0,0-1.42,1.42L18.59,20H14a1,1,0,0,0,0,2h6a2,2,0,0,0,2-2V14A1,1,0,0,0,21,13Z" fill={color}></path>
            </g>
        </svg>
    );
}