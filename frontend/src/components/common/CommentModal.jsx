import { useEffect, useState } from "react";
import api from "../../api/api";
import useAuth from "../../context/useAuth";
import "./CommentModal.css";
import Textarea from '../../components/common/Textarea';
import { FaTrash, FaTimes } from "react-icons/fa";


export default function CommentModal({ modulo, registroId, onClose, onNewComment, onDeleteComment }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const { user } = useAuth();

  const fetchComments = async () => {
    const res = await api.get(`/comments/${modulo}/${registroId}`);
    setComments(res.data);
  };

  useEffect(() => {
    fetchComments();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/comments", {
      table_name: modulo,
      record_id: registroId,
      user_id: user.id,
      content
    });
    setComments([res.data, ...comments]);
    setContent("");
    if (onNewComment) onNewComment();
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}?user_id=${user.id}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      if (onDeleteComment) onDeleteComment(); // atualiza o total
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => {
        e.stopPropagation();
        onClose();
      }}>
      <div className="modal-content comentario-modal" onClick={e => e.stopPropagation()}>
        <button
          className="new-modal-close"
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}>
          <FaTimes />
        </button>
        <h2>Comentários</h2>

        <form onSubmit={handleSubmit}>
          <Textarea
            label=""
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={4}
            required
          />
          <button type="submit">Enviar</button>
        </form>

        <div className="comment-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <p><strong>{c.user ? c.user.name : "Usuário"}:</strong> {c.content}</p>
              <small>{new Date(c.created_at).toLocaleString()}</small>

              {/* Botão de excluir apenas se for o próprio usuário */}
              {c.user_id === user.id && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(c.id)}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
