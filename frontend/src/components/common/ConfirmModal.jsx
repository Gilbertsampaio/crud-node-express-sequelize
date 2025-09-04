import './ConfirmModal.css';

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p dangerouslySetInnerHTML={{ __html: message }}></p>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onConfirm}>Confirmar</button>
          <button className="cancel-btn" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}