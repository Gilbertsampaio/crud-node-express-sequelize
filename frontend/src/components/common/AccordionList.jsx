import { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./AccordionList.css";
import { useNavigate } from "react-router-dom";
import ImageModal from '../../components/common/ImageModal';
import LikeButton from "../../components/common/LikeButton";
import CommentButton from "../../components/common/CommentButton";
import useAuth from "../../context/useAuth";

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
var API_URL = (typeof importMeta !== 'undefined' ? import.meta.env.VITE_API_URL : 'http://localhost:5173') || 'http://localhost:5173';
const avatarUrl = "/images/avatar.png";

export default function AccordionList({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const navigate = useNavigate();
    const handleEdit = (id) => navigate(`/usuarios/editar/${id}`);

    const [selectedImage, setSelectedImage] = useState(null);
    const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
    const closeImageModal = () => setSelectedImage(null);
    const { user } = useAuth();

    return (
        <div className="accordion-list">
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div key={item.id} className={`accordion-item ${isOpen ? "open" : ""}`}>
                        <div
                            className="accordion-header"
                            onClick={() => toggleItem(index)}
                        >
                            {isOpen ? (
                                <FaTimes className="icon" />
                            ) : (
                                <FaCheck className="icon" />
                            )}
                            <span>{item.name}</span>
                            <LikeButton
                                modulo="users"
                                registroId={item.id}
                                posicao="right"
                            />
                            <CommentButton
                                modulo="users"
                                registroId={item.id}
                                posicao="right"
                            />
                        </div>

                        <div className="accordion-content">
                            {/* Avatar */}
                            <div className="user-info">
                                {item.image ? (
                                    <div
                                        className="user-avatar"
                                        alt={item.name}
                                        style={{ backgroundImage: user.id === item.id ? `url(${API_URL}/uploads/${user.image})` : `url(${API_URL}/uploads/${item.image})` }}
                                         onClick={() =>
                                            openImageModal(user.id === item.id ? `${API_URL}/uploads/${user.image}` : `${API_URL}/uploads/${item.image}`)
                                        }
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><rect width='100%' height='100%' fill='%23eee'/></svg>";
                                        }}
                                        >
                                    </div>
                                ) : (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar do usuário"
                                        className="user-avatar"
                                        onClick={() => openImageModal(avatarUrl)}
                                    />
                                )}

                                <div>
                                    <p>{item.email}</p>
                                    {item.name && (
                                        <span
                                            className="edit-link"
                                            onClick={() => handleEdit(item.id)}
                                        >
                                            Editar {item.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            <ImageModal
                show={!!selectedImage}
                imageUrl={selectedImage}
                onClose={closeImageModal}
            />
        </div>
    );
}
