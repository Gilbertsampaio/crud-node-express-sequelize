import { useState, useEffect } from "react";
import { FaRegComment } from "react-icons/fa";
import api from "../../api/api";
import CommentModal from "./CommentModal";
import "./CommentButton.css";

export default function CommentButton({ modulo, registroId, posicao = null }) {
    const [total, setTotal] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        api.get(`/comments/total/${modulo}/${registroId}`).then(res => {
            setTotal(res.data.total);
        });
    }, [modulo, registroId]);

    const handleClick = (e) => {
        e.stopPropagation();
        setOpen(true);
    };

    const updateTotal = (delta) => setTotal(prev => prev + delta);

    const posClass = posicao ? posicao : "left";

    return (
        <>
            <div className={`comment-button ${posClass}`} onClick={handleClick}>
                <FaRegComment />
                <span>{total}</span>
            </div>
            {open && (
                <CommentModal
                    modulo={modulo}
                    registroId={registroId}
                    onClose={() => setOpen(false)}
                    onNewComment={() => updateTotal(1)}
                    onDeleteComment={() => updateTotal(-1)}
                />
            )}
        </>
    );
}
