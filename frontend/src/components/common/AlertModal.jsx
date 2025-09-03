// src/components/common/AlertModal.jsx
import './AlertModal.css';

export default function AlertModal({ show, title, message, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
