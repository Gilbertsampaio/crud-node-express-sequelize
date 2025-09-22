// src/components/common/ImageModal.js
import './ImageModal.css';
import { FaTimes } from 'react-icons/fa';

export default function ImageModal({ show, imageUrl, type, onClose }) {
  if (!show) return null;

  return (
    <div className="image-modal-overlay" /*onClick={onClose}*/ onClick={(e) => e.stopPropagation()}>
      <div className="image-modal-content">
        {type === "video" ? (
          <video
            src={imageUrl}
            controls
            autoPlay
            className="image-modal-img"
          />
        ) : (
          <img
            src={imageUrl}
            alt="Visualização"
            className="image-modal-img"
          />
        )}
        <button className="image-modal-close" onClick={onClose} aria-label="Fechar">
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
