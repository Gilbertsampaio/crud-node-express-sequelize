import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaHome, FaTrash } from 'react-icons/fa';
import './UsuarioList.css';
import ConfirmModal from '../../components/common/ConfirmModal';
import AuthContext from '../../context/AuthContext';

export default function UsuarioList() {
  const { user: currentUser, loading } = useContext(AuthContext); // pega o usuário logado
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

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

  if (loading) return <p>Carregando...</p>; // espera o carregamento do contexto

  const columns = [
    { key: 'id', label: 'ID' },
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
        <h2>Lista de Usuários</h2>
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

      <Table columns={columns} data={usuarios} />

      <ConfirmModal
        show={showModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
