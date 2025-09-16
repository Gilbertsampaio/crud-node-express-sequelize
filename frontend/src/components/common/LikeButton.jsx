import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import api from "../../api/api";
import "./LikeButton.css";
import useAuth from "../../context/useAuth";
import Tooltip from "./Tooltip";

export default function LikeButton({ modulo, registroId, posicao = null }) {
    const [liked, setLiked] = useState(false);
    const [total, setTotal] = useState(0);
    const [users, setUsers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStatus = async () => {
            const res = await api.get("/likes/status", {
                params: {
                    table_name: modulo,
                    record_id: registroId,
                    user_id: user.id
                }
            });
            setTotal(res.data.total);
            setLiked(res.data.liked);

            // Buscar os usuários que curtiram
            const usersRes = await api.get(`/likes/users/${modulo}/${registroId}`);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        };
        fetchStatus();
    }, [modulo, registroId, user.id]);

    const toggleLike = async () => {
        const res = await api.post("/likes/toggle", {
            table_name: modulo,
            record_id: registroId,
            user_id: user.id
        });
        setLiked(res.data.liked);
        setTotal(prev => res.data.liked ? prev + 1 : prev - 1);

        // Atualiza lista de usuários
        const usersRes = await api.get(`/likes/users/${modulo}/${registroId}`);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        toggleLike();
    };

    const posClass = posicao ? posicao : "left";
    const posClassTooltip = modulo === 'storys' ? true : false;

    return (
        <div className={`like-button ${posClass}`} onClick={handleClick}>
            {total > 0 ? (
                <Tooltip storys={posClassTooltip}
                    text={
                        <ul style={{ margin: 0, padding: '0 0 0 0rem', listStyle: 'none' }}>
                            {users.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    }
                >
                    {liked ? <FaHeart className="liked" /> : <FaRegHeart />}
                </Tooltip>
            ) : (
                liked ? <FaHeart className="liked" /> : <FaRegHeart />
            )}
            <span>{total}</span>
        </div>
    );
}
