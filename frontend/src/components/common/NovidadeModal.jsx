import { useState, useEffect } from "react";
import "./NovidadeModal.css";
import { formatarData } from "../../utils/helpers";
import { FaTimes } from "react-icons/fa";

const IMAGEM_PADRAO = "../../../images/news.png";

export default function NovidadeModal({ show, novidade, onClose }) {
  const [selectedImage, setSelectedImage] = useState(IMAGEM_PADRAO);

  useEffect(() => {
    if (show && novidade) {
      setSelectedImage(novidade.imagemUrl || IMAGEM_PADRAO);
    }
  }, [show, novidade]);

  if (!show || !novidade) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content novidade-modal">
        <button className="new-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <img
          src={selectedImage}
          alt={novidade.titulo}
          className="novidade-imagem"
          onError={() => setSelectedImage(IMAGEM_PADRAO)}
        />

        <h2 className="novidade-titulo">{novidade.titulo}</h2>

        <div className="novidade-meta">
          <span>📅 {formatarData(novidade.dataPostagem)}</span>
          <span>👤 {novidade.autor}</span>
        </div>

        <p className="novidade-descricao">{novidade.descricao}</p>
      </div>
    </div>
  );
}
