import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import api from "../../api/api";
import "./EnqueteButton.css";
import useAuth from "../../context/useAuth";
import Tooltip from "./Tooltip";

export default function EnqueteButton({ index, enquete, text, totalGeral, setTotalGeral, multiplos, votedRadio, setVotedRadio }) {
    const [voted, setVoted] = useState(false);
    const [total, setTotal] = useState(0);
    const [users, setUsers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStatus = async () => {
            const res = await api.get("/enquetes/status", {
                params: {
                    resposta_index: index,
                    mensagem_id: enquete,
                    user_id: user.id
                }
            });
            setTotal(res.data.total);
            setVoted(res.data.voto);

            // Buscar os usuários que curtiram
            const usersRes = await api.get(`/enquetes/users/${index}/${enquete}`);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

            const totalRes = await api.get(`/enquetes/totalGeral/${enquete}`);
            setTotalGeral(totalRes.data.total);
        };
        fetchStatus();
    }, [index, enquete, user.id, setTotalGeral]);

    // ?? MUDANÇA 1: Lógica de desmarcação no Front-end (Ativada quando `!multiplos` é TRUE)
    useEffect(() => {
        // Se `multiplos` é FALSE, estamos no modo RÁDIO (Seleção Única).
        if (!multiplos && votedRadio !== null && votedRadio > 0) {
            
            // Desmarca o voto do botão que NÃO foi o que disparou o evento (votedRadio).
            if (votedRadio !== index && voted) {
                setVoted(false);
                setTotal(prev => prev - 1); 
            }
        }
    }, [votedRadio, index, multiplos, voted]);

    useEffect(() => {
        setTotalGeral(totalGeral);
    }, [totalGeral, setTotalGeral]);

    const toggleLike = async () => {
        const res = await api.post("/enquetes/toggle", {
            resposta_index: index,
            mensagem_id: enquete,
            user_id: user.id,
            // ?? MUDANÇA 2: O valor enviado para o backend deve refletir a lógica correta:
            // Se `multiplos` é FALSE no Front-end, o backend deve tratar como seleção única.
            // Passamos o booleano 'multiplos' (que é FALSE) para o backend.
            multiplos: multiplos 
        });
        const novoStatus = res.data.voto;

        setVoted(novoStatus);
        setTotal(prev => novoStatus ? prev + 1 : prev - 1);

        const usersRes = await api.get(`/enquetes/users/${index}/${enquete}`);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

        const totalRes = await api.get(`/enquetes/totalGeral/${enquete}`);
        setTotalGeral(totalRes.data.total);
    };

    const handleClick = (e) => {
        e.stopPropagation();

        // ?? MUDANÇA 3: Notificação ao pai (votedRadio) ativada quando `!multiplos` é TRUE (modo rádio).
        if (!multiplos) {
            // Notifica o pai para desmarcar os outros.
            setVotedRadio(index);
        }

        toggleLike();
    };

    // O tipo de input permanece como "checkbox" em ambos os casos para permitir a desmarcação,
    // conforme você solicitou na última mensagem.
    const inputType = "checkbox"; 

    return (
        <li
            key={index}
            onClick={handleClick}
        >
            <div>
                <div className="container-check" >
                    <input
                        type={inputType}
                        name={`enquete-${enquete}`}
                        checked={voted}
                        onChange={() => { }}
                        style={{ display: "none" }}
                    />
                    <div
                        className={`check ${voted ? "checked" : ""
                            }`}
                    ></div>
                </div>
                <div className="resposta-texto">
                    {index}. {text}
                </div>
                <div className="resposta-pontuacao">{total}</div>
            </div>
            <div className="range">
                <div
                    className="total"
                    style={{
                        width: `${totalGeral > 0 ? (total / totalGeral) * 100 : 0}%`,
                    }}
                ></div>
            </div>
        </li>
    );
}