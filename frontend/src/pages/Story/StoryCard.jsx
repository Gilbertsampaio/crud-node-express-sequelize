import React from "react";
import "./StoryCard.css";

export default function StoryCard({ story, onEdit, onDelete }) {
  const expired = story.status === "expired";

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

  return (
    <div className={`story-card ${expired ? "expired" : ""}`}>
      <div className="thumb">
        {story.media_url ? (
          story.type === "image" ? <img src={`${API_URL}/uploads/${story.media_url}`} alt="thumb" /> : <video src={story.media_url} />
        ) : (
          <div className="placeholder">Sem mídia</div>
        )}
      </div>

      <div className="info">
        <div className="meta">
          <strong>{story.title || "—"}</strong>
          <span className="small">{new Date(story.created_at || story.createdAt).toLocaleString()}</span>
        </div>
        <div className="actions">
          <button onClick={onEdit} className="btn small">Editar</button>
          <button onClick={onDelete} className="btn small danger">Excluir</button>
        </div>
      </div>
    </div>
  );
}
