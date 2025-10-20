import React, { useState, useEffect } from "react";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import StarIcon from "./icons/StarIcon";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
import api from "../../api/api";
import useAuth from "../../context/useAuth";
import { formatarDataPersonalizada } from "../../utils/helpers";

export default function DetalhesEnquete({ idEvento, showDetalhesEvento, setShowDetalhesEvento }) {

    const [error, setError] = useState("");
    const [participantes, setParticipantes] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [dataEvento, setDataEvento] = useState("");
    const [horaEvento, setHoraEvento] = useState("");
    const [dataEventoFinal, setDataEventoFinal] = useState("");
    const [horaEventoFInal, setHoraEventoFinal] = useState("");
    const [local, setLocal] = useState("");
    const [link, setLink] = useState("");

    const getAvatar = avatar => avatar ? `${API_URL}/uploads/${avatar}` : "/images/avatar.png";
    const { user } = useAuth();

    useEffect(() => {
        if (showDetalhesEvento) {
            // const fetchParticipantes = async () => {
            //     try {
            //         const eventoDados = await api.get(`/eventos/participantes/${idEvento}`);
            //         setParticipantes(Array.isArray(eventoDados.data) ? eventoDados.data : []);
            //         setTitulo(eventoDados.data.evento?.metadata?.titulo);
            //         setDescricao(eventoDados.data.evento?.metadata?.descricao);
            //         setDataEvento(eventoDados.data.evento?.metadata?.dataInicio);
            //         setHoraEvento(eventoDados.data.evento?.metadata?.horaInicio);
            //         setDataEventoFinal(eventoDados.data.evento?.metadata?.dataFim);
            //         setHoraEventoFinal(eventoDados.data.evento?.metadata?.horaFim);
            //         setLocal(eventoDados.data.evento?.metadata?.local);
            //         setLink(eventoDados.data.evento?.metadata?.link);
            //     } catch {
            //         setError("Erro ao buscar participantes.");
            //     }
            // };

            // fetchParticipantes();
        }
    }, [idEvento, showDetalhesEvento]);

    return (
        <div className={`detalhesEnquete ${showDetalhesEvento && "open"}`}>
            <div className="enquete-header">
                <button
                    className="close-enquete"
                    onClick={() => setShowDetalhesEvento(false)}
                >
                    <CloseRoundedIcon size={24} color="#0A0A0A" />
                </button>
                <span>Dados da enquete</span>
            </div>
            <div className="enquete-body">
                <div className="containerPergunta">
                    
                </div>
                <div className="containerRespostas">

                    {/* {respostas.map((r) => (
                        <React.Fragment key={r.index}>
                            <div
                                className="containerPreview">
                                <div>{r.text}</div>
                                <div className={`zeroVoto ${r.totalVotos > 0 && "sucesso"}`}>
                                    <span>{`${r.totalVotos} ${r.totalVotos === 1 ? "voto" : "votos"}`}</span>
                                    {r.totalVotos > 0 && (
                                        <StarIcon size={16} color="#15603E" />
                                    )}
                                </div>
                            </div>
                            {r.votos.map((v) => (
                                // 🟢 CORREÇÃO: O key aqui também deve ser único, use v.index ou v.id
                                <div className="containerRespotasVotou" key={v.id}>
                                    <span className="image" style={{ backgroundImage: `url(${getAvatar(v.user_image)})` }} />
                                    <div className="containerRespotasVotou_detalhes">
                                        <div className="nomeVoto">{v.user_id === user.id ? "Você" : v.user_name}</div>
                                        <div className="dataVoto">{formatarDataPersonalizada(v.createdAt)}</div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))} */}
                </div>
            </div>
        </div>
    );
}
