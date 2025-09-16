// src/pages/StoryList.jsx
import { useState, useEffect, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import { FaPlus, FaEdit, FaHome, FaTrash, FaBookOpen } from "react-icons/fa";
import ConfirmModal from "../../components/common/ConfirmModal";
import ImageModal from "../../components/common/ImageModal";
import LoadingModal from "../../components/common/LoadingModal";
import AuthContext from "../../context/AuthContext";

export default function StoryList() {
  const { user: currentUser } = useContext(AuthContext);

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const openImageModal = (url, type) => setSelectedMedia({ url, type });
  const closeImageModal = () => setSelectedMedia(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/stories/user/${currentUser.id}`);
      setStories(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error === "logout") {
        setError("logout");
      } else {
        setError("Erro ao buscar stories: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) fetchStories();
  }, [fetchStories, currentUser?.id]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && closeImageModal();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const handleEdit = (id) => navigate(`/stories/editar/${id}`);
  const handleNew = () => navigate("/stories/novo");
  const handleHome = () => navigate("/");

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/stories/${selectedId}`);
      setSuccessMessage("Story excluído com sucesso!");
      fetchStories();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir storie: " + err.message);
    } finally {
      setLoading(false);
      setShowModal(false);
      setSelectedId(null);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "media_url",
      label: "Mídia",
      render: (story) =>
        story.type === "video" ? (
          <video
            src={`${API_URL}/uploads/${story.media_url}`}
            title={story.title || "Story"}
            style={{
              width: 80,
              height: 80,
              borderRadius: "8px",
              objectFit: "cover",
              cursor: "zoom-in",
            }}
            onClick={() =>
              openImageModal(`${API_URL}/uploads/${story.media_url}`, "video")
            }
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23eee'/></svg>";
            }}
            controls={false}
          />
        ) : (
          <img
            src={`${API_URL}/uploads/${story.media_url}`}
            alt={story.title || "Story"}
            style={{
              width: 80,
              height: 80,
              borderRadius: "8px",
              objectFit: "cover",
              cursor: "zoom-in",
            }}
            onClick={() =>
              openImageModal(`${API_URL}/uploads/${story.media_url}`, "image")
            }
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23eee'/></svg>";
            }}
          />
        ),
    },
    { key: "title", label: "Título" },
    { key: "type", label: "Tipo" },
    {
      key: "actions",
      label: "Ações",
      render: (story) => (
        <div style={{ display: "flex", gap: "5px", justifyContent: "flex-end" }}>
          <Button
            className="action btn-primary"
            onClick={() => handleEdit(story.id)}
          >
            <FaEdit />
          </Button>
          <Button
            className="action btn-danger"
            onClick={() => handleDeleteClick(story.id)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
      className: "actions-column",
    },
  ];

  return (
    <div className="container">
      <LoadingModal show={loading} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <h2>
          <FaBookOpen style={{ marginRight: "8px" }} />
          Stories
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button className="btn-primary" onClick={handleHome}>
            <FaHome />
          </Button>
          <Button className="btn-success" onClick={handleNew}>
            <FaPlus />
          </Button>
        </div>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && error !== "logout" && <p className="error">{error}</p>}

      <Table
        columns={columns}
        data={stories}
        emptyMessage="Nenhum storie encontrado."
      />

      <ConfirmModal
        show={showModal}
        title="Confirmar exclusão"
        message="Deseja realmente excluir este storie?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ImageModal
        show={!!selectedMedia}
        imageUrl={selectedMedia?.url}
        type={selectedMedia?.type}
        onClose={closeImageModal}
      />
    </div>
  );
}
