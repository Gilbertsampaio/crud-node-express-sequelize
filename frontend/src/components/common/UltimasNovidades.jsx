import { useEffect, useState } from "react";
import { FaNewspaper, FaUser, FaListOl, FaCalendarDay } from "react-icons/fa";
import api from "../../api/api";
import ImageModal from '../../components/common/ImageModal';
import Tooltip from "../../components/common/Tooltip";
import "./UltimasNovidades.css"; // crie um css para estilizar os cards
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
import { formatarData } from '../../utils/helpers';

const IMAGEM_PADRAO = "/images/news.png"; // placeholder se não houver imagem

export default function UltimasNovidades() {
    const [novidades, setNovidades] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
    const closeImageModal = () => setSelectedImage(null);

    useEffect(() => {
        const fetchDados = async () => {
            try {
                const [resNovidades, resUsuarios, resCategorias] = await Promise.all([
                    api.get("/news"),
                    api.get("/users"),
                    api.get("/categories")
                ]);

                // Ordena da mais recente para a mais antiga e pega apenas 3
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

    return (
        <div className="ultimas-novidades-container">

            {error && <p className="error">{error}</p>}

            <div className="novidades-grid">
                {novidades.map((news) => (
                    <div key={news.id} className="novidade-card">
                        <div className="image-wrapper">
                            <img
                                src={API_URL + "/uploads/" + news.image || IMAGEM_PADRAO}
                                alt={news.title}
                                className="novidade-image img-preview"
                                onClick={() => openImageModal(API_URL + "/uploads/" + news.image)}
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
                        <h4>{news.title}</h4>
                        <p>{news.description}</p>
                    </div>
                ))}
            </div>
            <ImageModal
                show={!!selectedImage}
                imageUrl={selectedImage}
                onClose={closeImageModal}
            />
        </div>
    );
}
