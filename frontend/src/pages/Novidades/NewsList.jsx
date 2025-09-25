// src/pages/NewsList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import LoadingModal from '../../components/common/LoadingModal';
import { FaPlus, FaEdit, FaTrash, FaHome } from 'react-icons/fa';
import ConfirmModal from '../../components/common/ConfirmModal';
import ImageModal from "../../components/common/ImageModal";
// import useAuth from "../../context/useAuth";
import './NewsList.css';

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const openImageModal = (url, type) => setSelectedMedia({ url, type });
  const closeImageModal = () => setSelectedMedia(null);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/news');
      console.log(res)
      setNews(res.data);
    } catch (err) {
      console.error(err);
      if (err.response.data.error === 'logout') {
        setError(err.response.data.error);
      } else {
        setError('Erro ao buscar novidades: ' + err.message);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const handleEdit = (id) => navigate(`/news/editar/${id}`);
  const handleNew = () => navigate('/news/novo');
  const handleHome = () => navigate('/');
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/news/${selectedId}`);
      setSuccessMessage('Novidade excluída com sucesso!');
      fetchNews();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir novidade: ' + err.message);
    } finally {
      setTimeout(() => setLoading(false), 0);
      setShowModal(false);
      setSelectedId(null);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: "image",
      label: "Mídia",
      render: (news) =>
      (
        <div
          className="user-image"
          alt={news.image || "Novidade"}
          style={{
            backgroundImage: `url(${API_URL}/uploads/${news.image})`,
            width: 80,
            height: 80,
            borderRadius: "8px",
            objectFit: "cover",
            cursor: "zoom-in",
          }}
          onClick={() => openImageModal(`${API_URL}/uploads/${news.image}`, "image")}
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23eee'/></svg>";
          }}
        >
        </div>
      )
    },
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição' },
    { key: 'category', label: 'Categoria', render: n => n.Category?.name || '' },
    { key: 'user', label: 'Criador', render: n => n.User?.name || '' },
    {
      key: 'actions',
      label: 'Ações',
      render: (service) => (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
          <Button className="action btn-primary" onClick={() => handleEdit(service.id)}>
            <FaEdit />
          </Button>
          <Button className="action btn-danger" onClick={() => handleDeleteClick(service.id)}>
            <FaTrash />
          </Button>
        </div>
      ),
      className: 'actions-column'
    }
  ];

  return (
    <div className="container">
      <LoadingModal show={loading} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h2>Novidades</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button className="btn-primary" onClick={handleHome}>
            <FaHome />
          </Button>
          <Button className="btn-success" onClick={handleNew}>
            <FaPlus />
          </Button>
        </div>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && error !== 'logout' && <p className="error">{error}</p>}

      <Table columns={columns} data={news} emptyMessage="Nenhuma novidade encontrada." />

      <ConfirmModal
        show={showModal}
        title="Confirmar exclusão"
        message="Deseja realmente excluir esta novidade?"
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
