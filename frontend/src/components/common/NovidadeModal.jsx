import './NovidadeModal.css';
import { formatarData } from '../../utils/helpers';
import { FaTimes } from 'react-icons/fa';

export default function NovidadeModal({ show, novidade, onClose }) {
  if (!show || !novidade) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content novidade-modal">
        <button className="new-modal-close" onClick={onClose}>
            <FaTimes />
        </button>
        
        <img 
          src={novidade.imagemUrl} 
          alt={novidade.titulo} 
          className="novidade-imagem"
        />

        <h2 className="novidade-titulo">{novidade.titulo}</h2>

        <div className="novidade-meta">
          <span>📅 {formatarData(novidade.dataPostagem)}</span>
          <span>👤 {novidade.autor}</span>
        </div>

        <p className="novidade-descricao">
          {novidade.descricao}
        </p>
      </div>
    </div>
  );
}
