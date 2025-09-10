import { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./AccordionList.css";
import { useNavigate } from "react-router-dom";
import ImageModal from '../../components/common/ImageModal';

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

    return (
        <div className="accordion-list">
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div key={item.id} className={`accordion-item ${isOpen ? "open" : ""}`}>
                        <button
                            className="accordion-header"
                            onClick={() => toggleItem(index)}
                        >
                            {isOpen ? (
                                <FaTimes className="icon" />
                            ) : (
                                <FaCheck className="icon" />
                            )}
                            <span>{item.name}</span>
                        </button>

                        <div className="accordion-content">
                            {/* Avatar */}
                            <div className="user-info">
                                {item.image ? (
                                    <img
                                        src={`${API_URL}/uploads/${item.image}`}
                                        alt={item.name}
                                        className="user-avatar"
                                        onClick={() =>
                                            openImageModal(`${API_URL}/uploads/${item.image}`)
                                        }
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><rect width='100%' height='100%' fill='%23eee'/></svg>";
                                        }}
                                    />
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
