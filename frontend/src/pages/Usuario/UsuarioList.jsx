import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaHome, FaTrash, FaUsers } from 'react-icons/fa';
import './UsuarioList.css';
import ConfirmModal from '../../components/common/ConfirmModal';
import ImageModal from '../../components/common/ImageModal';
import AuthContext from '../../context/AuthContext';

export default function UsuarioList() {
  const { user: currentUser, loading } = useContext(AuthContext); // pega o usuário logado
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
  const closeImageModal = () => setSelectedImage(null);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      const resUsuarios = await api.get('/users');
      setUsuarios(resUsuarios.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar dados: ' + err.message);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && closeImageModal();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const handleEdit = (id) => navigate(`/usuarios/editar/${id}`);
  const handleNew = () => navigate('/usuarios/novo');
  const handleHome = () => navigate('/');

  const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${selectedUserId}`);
      setSuccessMessage('Usuário excluído com sucesso!');
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir usuário: ' + err.message);
    } finally {
      setShowModal(false);
      setSelectedUserId(null);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

  if (loading) return <p>Carregando...</p>; // espera o carregamento do contexto

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'image',
      label: 'Foto',
      render: (usuario) => (
        usuario.image ? (
          <img
            src={`${API_URL}/uploads/${usuario.image}`}
            alt={usuario.name}
            style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', cursor: 'zoom-in' }}
            onClick={() => openImageModal(`${API_URL}/uploads/${usuario.image}`)}
            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="100%" height="100%" fill="%23eee"/></svg>'; }}
          />
        ) : (
          <span>Sem foto</span>
        )
      )
    },
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'actions',
      label: 'Ações',
      render: (usuario) => (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
          <Button className="action btn-primary" onClick={() => handleEdit(usuario.id)}>
            <FaEdit />
          </Button>
          {usuario.id !== currentUser.id && ( // oculta o botão se for o próprio usuário
            <Button className="action btn-danger" onClick={() => handleDeleteClick(usuario.id)}>
              <FaTrash />
            </Button>
          )}
        </div>
      ),
      className: 'actions-column'
    }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>
          <span style={{ marginRight: '8px' }}><FaUsers /></span>
          Lista de Usuários
        </h2>
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
      {error && <p className="error">{error}</p>}

      <Table columns={columns} data={usuarios} emptyMessage="Nenhum registro encontrado." />

      <ConfirmModal
        show={showModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ImageModal
        show={!!selectedImage}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />
    </div>
  );

}
