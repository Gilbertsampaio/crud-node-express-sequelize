import React, { useState, useEffect } from "react";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import CalendarMonthIcon from './icons/CalendarMonthIcon';
import LocationOutline from './icons/LocationOutline';
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
    const [criador, setCriador] = useState({});

    const getAvatar = avatar => avatar ? `${API_URL}/uploads/${avatar}` : "/images/avatar.png";
    const { user } = useAuth();

    useEffect(() => {
        if (showDetalhesEvento) {
            const fetchParticipantes = async () => {
                try {
                    const res = await api.get(`/messages/evento/${idEvento}`);
                    const eventoDados = res.data;
                    console.log(eventoDados)
                    setParticipantes(Array.isArray(eventoDados.metadata.participantes) ? eventoDados.metadata.participantes : []);
                    setTitulo(eventoDados.metadata?.titulo);
                    setDescricao(eventoDados.metadata?.descricao);
                    setDataEvento(eventoDados.metadata?.dataInicio);
                    setHoraEvento(eventoDados.metadata?.horaInicio);
                    setDataEventoFinal(eventoDados.metadata?.dataFim);
                    setHoraEventoFinal(eventoDados.metadata?.horaFim);
                    setLocal(eventoDados.metadata?.local);
                    setLink(eventoDados.metadata?.link);
                    setCriador(eventoDados.metadata?.criador || {});
                } catch {
                    setError("Erro ao buscar participantes.");
                }
            };

            fetchParticipantes();
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
                <span>Informações do evento</span>
            </div>
            <div className="enquete-body">
                <div className="containerPergunta">
                    {titulo}
                </div>
                <span>{descricao}</span>
                <div className="containerRespostas">
                    <React.Fragment key={titulo}>
                        <div className="containerPreview" style={{ justifyContent: 'start', alignItems: 'start'}}>
                            <div className="imgEvento preview">
                                <CalendarMonthIcon size={20} color={'#333333'} />
                            </div>
                            <div>
                                <span>
                                    {formatarDataPersonalizada(`${dataEvento}T${horaEvento}:00`)} 
                                </span>
                                <span>
                                    {dataEventoFinal && horaEventoFInal ? ` a ${formatarDataPersonalizada(`${dataEventoFinal}T${horaEventoFInal}:00`)}` : ''}
                                </span>
                            </div>
                        </div>
                        { local && (
                            <div className="containerPreview" style={{ justifyContent: 'start', alignItems: 'start'}}>
                                <div className="imgEvento preview">
                                    <LocationOutline size={20} color={'#333333'} />
                                </div>
                                <div>
                                    <span>
                                        {local} 
                                    </span>
                                    <span>
                                        Abrir no mapa
                                    </span>
                                </div>
                            </div>
                        )}
                        <span style={{ color: '#787878', fontSize: 14 }}>{participantes.length} {participantes.length === 1 ? "pessoa respondeu" : "pessoas responderam"}</span>

                        <div className="listaParticipantes" style={{ marginBottom: 20 }}>
                            {participantes.filter(participante => participante.opcao === "vou").map(participante => (
                                <div className="containerRespotasVotou" key={participante.id}>
                                    <span className="image" style={{ backgroundImage: `url(${getAvatar(participante.imagem)})` }} />
                                    <div className="containerRespotasVotou_detalhes" style={{ width: "80%"}}>
                                        <div className="nomeParticipantes">
                                            <span>{participante.id === user.id ? "Você" : participante.nome} </span>
                                            { criador.id === participante.id && <span style={{ color: '#15603E', backgroundColor: '#D9FDD3', fontSize: 12, marginLeft: 6, padding: '4px 6px', borderRadius: 12 }}>Criador do evento</span> }
                                        </div>
                                        <div className="dataVoto">{formatarDataPersonalizada(participante.createdAt)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                         
                    </React.Fragment>
                </div>
            </div>
        </div>
    );
}
