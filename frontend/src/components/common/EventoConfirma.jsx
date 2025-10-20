import React, { useState, useRef, useEffect, useMemo } from "react";
import ChevronIcon from "./icons/ChevronIcon";
import "./EventoConfirma.css";
import api from '../../api/api';
import useAuth from "../../context/useAuth";

export default function EventoConfirma({
    mensagemId,
    isOpen,
    onToggle,
    onSelect,
    setOnSelect,
    setOpenConfirma,
    hideDropConfirma,
    setParticipantes
}) {
    const [closing, setClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [dropStyle, setDropStyle] = useState({});
    const [dropDirection, setDropDirection] = useState("down");
    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [selectedLabel, setSelectedLabel] = useState("Confirmar");

    //FECHA O DROPDOWN AO CLICAR FORA
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                onToggle(false);
            }
        }

        document.addEventListener("click", handleClickOutside, { passive: true });

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isOpen, onToggle]);

    //ABRE E FECHAR O DROPDOWN
    useEffect(() => {
        if (isOpen && !hideDropConfirma) {
            setIsVisible(true);   // mostra o dropdown no DOM
            setClosing(false);    // garante que não está fechando

            // aqui você define dropStyle inicial + transição aberta
            const buttonRect = wrapperRef.current.getBoundingClientRect();
            const dropdownHeight = 150;
            const spaceBottom = window.innerHeight - buttonRect.bottom;
            const spaceTop = buttonRect.top;

            let top = buttonRect.bottom - 30;
            let direction = "down";

            if (spaceBottom < dropdownHeight && spaceTop > spaceBottom) {
                top = buttonRect.top - dropdownHeight + 30;
                direction = "up";
            }

            const translateY = direction === "down" ? 6 : -6;

            setDropStyle({
                position: "fixed",
                top: top,
                right: window.innerWidth - buttonRect.right - 130,
                minWidth: "210px",
                zIndex: 1001,
                transform: `scale(0.85) translateY(${translateY}px)`,
                opacity: 0,
                transformOrigin: direction === "down" ? "top left" : "bottom left",
                pointerEvents: "none",
            });

            setTimeout(() => {
                setDropStyle(prev => ({
                    ...prev,
                    transform: "scale(1) translateY(0)",
                    opacity: 1,
                    pointerEvents: "auto",
                    transition: "transform 220ms cubic-bezier(.2,.9,.2,1), opacity 180ms ease",
                }));
            }, 20);

            setDropDirection(direction);

        } else if (isVisible) {
            // Ao fechar: aplica animação de fechamento
            setClosing(true);

            setDropStyle(prev => ({
                ...prev,
                transform: "scale(0.85) translateY(6px)",
                opacity: 0,
                pointerEvents: "none",
                transition: "transform 180ms cubic-bezier(.2,.9,.2,1), opacity 150ms ease",
            }));

            // Remove do DOM depois da animação (ex: 180ms)
            const timer = setTimeout(() => {
                setIsVisible(false);
                setClosing(false);
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [isOpen, dropDirection, isVisible, hideDropConfirma]);

    //OPÇÕES DO DROPDOWN
    const options = useMemo(() => [
        { id: "vou", label: "Vou" },
        { id: "talvez", label: "Talvez" },
        { id: "naoVou", label: "Não vou" },
    ], []);

    useEffect(() => {
        const option = options.find(opt => opt.id === onSelect);
        setSelectedLabel(option?.label || "Confirmar");
    }, [onSelect, options]);

    //CHAMA A OPÇÃO SELECIONADA
    const handleSelect = async (optionId) => {

        const payload = {
            participante: {
                id: user.id,
                nome: user.name,
                imagem: user.image,
                opcao: optionId
            }
        }

        let retorno;

        try {
            retorno = await api.put(`/messages/evento/${mensagemId}/participantes`, payload);
        } catch (err) {
            if (err.response.data.error === 'logout') {
                setError(err.response.data.error);
            } else {
                if (err.response?.data?.errors) setError(err.response.data.errors.join(', '));
                else if (err.response?.data?.error) setError(err.response.data.error);
                else setError('Erro ao confirmar presença');
            }
        } finally {
            if (retorno) {
                setParticipantes(retorno.data.metadata.participantes);
                setOnSelect(optionId);
                setTimeout(() => {
                    onToggle(false);
                }, 50);
            }
        }
    };

    return (
        <>
            <button
                className="showVotes"
                onClick={() => {
                    setOpenConfirma(prev => !prev);
                }}
                ref={wrapperRef}
            >
                {error && error !== 'logout' && error !== 'Todos os campos são obrigatórios.'
                    ? <p className="error">{error}</p>
                    : selectedLabel} <ChevronIcon size="18" color="#1B8755" />
            </button>
            <div
                ref={dropdownRef}
                className={`attachment-dropdown ${closing ? "closed" : "open"} down`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    ...dropStyle,
                    position: "fixed",
                }}
            >
                {options.map((opt, index) => (
                    <div
                        key={opt.id}
                        className="attachment-option"
                        style={{ minWidth: "210px", transitionDelay: `${index * 30}ms` }}
                        onClick={() => {
                            handleSelect(opt.id);
                        }}
                    >
                        <div className={`radioEvento ${onSelect === opt.id ? opt.id : ''}`}></div>
                        <span style={{ color: "rgba(12, 9, 9, 0.6)", fontSize: ".9375rem" }}>{opt.label}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
