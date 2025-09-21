// src/components/common/ImageModal.js
import './ImageModal.css';
import { FaTimes } from 'react-icons/fa';

export default function ImageModal({ show, imageUrl, type, onClose }) {
  if (!show) return null;

  console.log(imageUrl)

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
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
