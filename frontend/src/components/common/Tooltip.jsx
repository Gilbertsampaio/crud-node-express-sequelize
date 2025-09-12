import { createPortal } from 'react-dom';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import './Tooltip.css';

export default function Tooltip({ children, text }) {
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef(null);
    const tooltipRef = useRef(null);

    useLayoutEffect(() => {
        if (show && wrapperRef.current && tooltipRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const tooltipHeight = tooltipRef.current.offsetHeight;
            const tooltipWidth = tooltipRef.current.offsetWidth;

            setCoords({
                top: rect.top + window.scrollY - tooltipHeight - 12,
                left: rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2,
            });
        }
    }, [show, text]);

    return (
        <>
            <div
                ref={wrapperRef}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="tooltip-wrapper"
            >
                {children}
            </div>

            {show &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        className="tooltip-portal"
                        style={{
                            position: 'absolute',
                            top: coords.top,
                            left: coords.left,
                        }}
                    >
                        {text}
                    </div>,
                    document.body
                )}
        </>
    );
}
