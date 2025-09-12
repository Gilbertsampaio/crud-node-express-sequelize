import { useEffect, useState } from "react";
import { FaUser, FaListOl, FaCalendarDay } from "react-icons/fa";
import api from "../../api/api";
import ImageModal from "../../components/common/ImageModal";
import Tooltip from "../../components/common/Tooltip";
import "./UltimasNovidades.css"; // crie um css para estilizar os cards
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
import { formatarData, limitarTexto } from "../../utils/helpers";
import NovidadeModal from "../../components/common/NovidadeModal";
import LikeButton from "../../components/common/LikeButton";
import CommentButton from "../../components/common/CommentButton";

const IMAGEM_PADRAO = "/images/news.png";

export default function UltimasNovidades() {
  const [novidades, setNovidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  const closeImageModal = () => setSelectedImage(null);

  const openNovidadeModal = (news) => setSelectedNews(news);
  const closeNovidadeModal = () => setSelectedNews(null);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resNovidades, resUsuarios, resCategorias] = await Promise.all([
          api.get("/news"),
          api.get("/users"),
          api.get("/categories"),
        ]);

        // Ordena da mais recente para a mais antiga e pega apenas 4
        const ultimas4 = resNovidades.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);

        setNovidades(ultimas4);
        setUsuarios(resUsuarios.data);
        setCategorias(resCategorias.data);
      } catch (err) {
        console.error(err);
        setError("Erro ao buscar novidades");
      }
    };

    fetchDados();
  }, []);

  const getPostDate = (id) => {
    const user = novidades.find((u) => u.id === id);
    return user ? formatarData(user.postDate) : "Data indefinida";
  };

  const getUserName = (id) => {
    const user = usuarios.find((u) => u.id === id);
    return user ? user.name : "Usuário não encontrado";
  };

  const getCategoryName = (id) => {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.name : "Categoria não definida";
  };

  const openImageModal = (imagePath) => {
    if (!imagePath) {

      setSelectedImage(IMAGEM_PADRAO);
      return;
    }

    const img = new Image();
    img.src = imagePath;
    img.onload = () => setSelectedImage(imagePath);
    img.onerror = () => setSelectedImage(IMAGEM_PADRAO);
  };

  return (
    <div className="ultimas-novidades-container">
      {error && <p className="error">{error}</p>}

      <div className="novidades-grid">
        {novidades.map((news) => (
          <div
            key={news.id}
            className="novidade-card"
          >
            <div className="image-wrapper">
              <img
                src={news.image ? API_URL + "/uploads/" + news.image : IMAGEM_PADRAO}
                alt={news.title}
                className="novidade-image img-preview"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageModal(news.image ? API_URL + "/uploads/" + news.image : null);
                }}
                onError={(e) => {
                  e.target.src = IMAGEM_PADRAO;
                }}
              />
              {news.postDate && (
                <span className="badge-icon-new">
                  <Tooltip text={getPostDate(news.id)}>
                    <FaCalendarDay />
                  </Tooltip>
                </span>
              )}
              {news.userId && (
                <span className="badge-icon-user">
                  <Tooltip text={getUserName(news.userId)}>
                    <FaUser />
                  </Tooltip>
                </span>
              )}
              {news.categoryId && (
                <span className="badge-icon">
                  <Tooltip text={getCategoryName(news.categoryId)}>
                    <FaListOl />
                  </Tooltip>
                </span>
              )}
            </div>
            <span onClick={() => openNovidadeModal(news)}>
              <h4>{news.title}</h4>
              <p>{limitarTexto(news.description, 60)}</p>
            </span>
            <LikeButton
              modulo="news"
              registroId={news.id}
            />
            <CommentButton
              modulo="news"
              registroId={news.id}
            />
          </div>
        ))}
      </div>

      {/* Modal para imagem */}
      <ImageModal
        show={!!selectedImage}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />

      {/* Modal para detalhes da novidade */}
      <NovidadeModal
        show={!!selectedNews}
        novidade={
          selectedNews && {
            imagemUrl: selectedNews.image
              ? API_URL + "/uploads/" + selectedNews.image
              : IMAGEM_PADRAO,
            titulo: selectedNews.title,
            descricao: selectedNews.description,
            autor: getUserName(selectedNews.userId),
            dataPostagem: selectedNews.postDate,
          }
        }
        onClose={closeNovidadeModal}
      />
    </div>
  );
}
