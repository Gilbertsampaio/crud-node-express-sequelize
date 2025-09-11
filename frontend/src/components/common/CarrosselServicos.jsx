import { useEffect, useRef, useState, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaPaintBrush, FaServer, FaCogs, FaUser } from "react-icons/fa";
import api from "../../api/api"; // ajuste o path se precisar
import "./CarrosselServicos.css";
import Tooltip from './Tooltip';
import ImageModal from "../../components/common/ImageModal";

const IMAGEM_PADRAO = "/images/servico.png"; // pode acessar direto do public

export default function CarrosselServicos({
    servicos,
    autoScrollTime = 3000,
    infinite = true,
}) {
    const carouselRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const closeImageModal = () => setSelectedImage(null);

    const fetchDados = useCallback(async () => {
        try {
            const [resCategorias, resUsuarios] = await Promise.all([
                api.get("/categories"),
                api.get("/users")
            ]);
            setCategorias(resCategorias.data);
            setUsuarios(resUsuarios.data);
        } catch (err) {
            console.error(err);
            if (err.response.data.error === 'logout') {
                setError(err.response.data.error);
            } else {
                setError('Erro ao buscar dados: ' + err.message);
            }
        }
    }, []);

    useEffect(() => { fetchDados(); }, [fetchDados]);

    const scroll = (direction) => {
        if (!carouselRef.current) return;

        const container = carouselRef.current;
        const width = container.offsetWidth;
        const scrollAmount = width;

        if (direction === "left") {
            if (infinite && container.scrollLeft === 0) {
                container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
            } else {
                container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            }
        } else {
            if (
                infinite &&
                Math.ceil(container.scrollLeft + container.offsetWidth) >=
                container.scrollWidth
            ) {
                container.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    useEffect(() => {
        if (autoScrollTime <= 0) return;
        const interval = setInterval(() => {
            if (!isPaused) scroll("right");
        }, autoScrollTime);

        return () => clearInterval(interval);
    }, [isPaused, autoScrollTime, infinite]);

    // Função para escolher o ícone de acordo com a categoria
    const getCategoryIcon = (categoria) => {
        switch (categoria) {
            case 1:
                return <FaPaintBrush />;
            case 2:
                return <FaServer />;
            case 3:
                return <FaCogs />;
            default:
                return null;
        }
    };

    const getCategoryName = (id) => {
        const cat = categorias.find((c) => c.id === id);
        return cat ? cat.name : "Categoria não definida";
    };

    const getUserName = (id) => {
        const user = usuarios.find((c) => c.id === id);
        return user ? user.name : "Usuário não encontrado";
    };

    const openImageModalSafe = (imagePath) => {
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
        <div
            className="carousel-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <button className="carousel-btn left" onClick={() => scroll("left")}>
                <FaChevronLeft />
            </button>

            {error && error !== 'logout' && <p className="error">{error}</p>}

            <div className="carousel" ref={carouselRef}>
                {servicos.map((servico) => (
                    <div key={servico.id} className="carousel-item">
                        <div className="image-wrapper">
                            <img
                                src={servico.image || IMAGEM_PADRAO}
                                alt={servico.title}
                                className="carousel-image"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openImageModalSafe(servico.image ? servico.image : null);
                                }}
                            />
                            {servico.userId && (
                                <span className="badge-icon-user">
                                    <Tooltip text={getUserName(servico.userId)}>
                                        <FaUser />
                                    </Tooltip>
                                </span>
                            )}
                            {servico.categoryId && (
                                <span className="badge-icon">
                                    <Tooltip text={getCategoryName(servico.categoryId)}>
                                        {getCategoryIcon(servico.categoryId)}
                                    </Tooltip>
                                </span>
                            )}
                        </div>
                        <h4>{servico.title}</h4>
                        <p>{servico.description}</p>
                    </div>
                ))}
            </div>

            <button className="carousel-btn right" onClick={() => scroll("right")}>
                <FaChevronRight />
            </button>

            {/* Modal para imagem */}
            <ImageModal
                show={!!selectedImage}
                imageUrl={selectedImage}
                onClose={closeImageModal}
            />
        </div>
    );
}
