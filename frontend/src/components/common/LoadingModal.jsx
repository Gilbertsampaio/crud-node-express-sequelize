// src/components/common/LoadingModal.jsx
import './LoadingModal.css';

export default function LoadingModal({ show }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content loading-content">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    </div>
  );
}
