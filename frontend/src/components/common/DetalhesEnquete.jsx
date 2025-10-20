import React, { useState, useEffect } from "react";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import StarIcon from "./icons/StarIcon";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
import api from "../../api/api";
import useAuth from "../../context/useAuth";
import { formatarDataPersonalizada } from "../../utils/helpers";

export default function DetalhesEnquete({ idEnquete, showDetalhesEnquete, setShowDetalhesEnquete }) {

    const [error, setError] = useState("");
    const [votos, setVotos] = useState([]);
    const [pergunta, setPergunta] = useState("");
    const [respostas, setRespostas] = useState([]);
    const getAvatar = avatar => avatar ? `${API_URL}/uploads/${avatar}` : "/images/avatar.png";
    const { user } = useAuth();

    useEffect(() => {
        if (showDetalhesEnquete) {
            const fetchVotos = async () => {
                try {
                    const votosRes = await api.get(`/enquetes/votos/${idEnquete}`);
                    setVotos(Array.isArray(votosRes.data) ? votosRes.data : []);
                    setPergunta(votosRes.data.enquete?.metadata?.pergunta);
                    setRespostas(votosRes.data.enquete?.metadata?.respostas)
                } catch {
                    setError("Erro ao buscar votos.");
                }
            };

            fetchVotos();
        }
    }, [idEnquete, showDetalhesEnquete]);

    return (
        <div className={`detalhesEnquete ${showDetalhesEnquete && "open"}`}>
            <div className="enquete-header">
                <button
                    className="close-enquete"
                    onClick={() => setShowDetalhesEnquete(false)}
                >
                    <CloseRoundedIcon size={24} color="#0A0A0A" />
                </button>
                <span>Dados da enquete</span>
            </div>
            <div className="enquete-body">
                <div className="containerPergunta">
                    {pergunta}
                </div>
                <div className="containerRespostas">

                    {respostas.map((r) => (
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
                    ))}
                </div>
            </div>
        </div>
    );
}
