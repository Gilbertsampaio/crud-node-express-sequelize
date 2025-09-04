import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaTrash, FaHome, FaListOl } from 'react-icons/fa';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';
import './CategoriaList.css';

export default function CategoriaList() {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchCategorias = async () => {
    try {
      const res = await api.get('/categories');
      setCategorias(res.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar categorias: ' + (err.message || ''));
    }
  };

  useEffect(() => { fetchCategorias(); }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const handleEdit = (id) => navigate(`/categorias/editar/${id}`);
  const handleNew = () => navigate('/categorias/novo');
  const handleHome = () => navigate('/');

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/categories/${selectedId}`);
      setSuccessMessage('Categoria excluída com sucesso!');
      fetchCategorias();
    } catch (err) {
      console.error(err);

      // Aqui exibimos o modal de alerta em vez da mensagem na tela
      const message =
        err.response?.data?.message ||
        'Não foi possível excluir a categoria.';
      setAlertMessage(message);
      setShowAlert(true);
    } finally {
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
    { key: 'name', label: 'Nome' },
    { key: 'description', label: 'Descrição' },
    {
      key: 'actions',
      label: 'Ações',
      render: (cat) => (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
          <Button className="action btn-primary" onClick={() => handleEdit(cat.id)}>
            <FaEdit />
          </Button>
          <Button className="action btn-danger" onClick={() => handleDeleteClick(cat.id)}>
            <FaTrash />
          </Button>
        </div>
      ),
      className: 'actions-column'
    }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>
          <span style={{ marginRight: '8px' }}><FaListOl /></span>
          Lista de Categorias
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
      
      <Table
        columns={columns}
        data={categorias}
        emptyMessage="Nenhum registro encontrado."
      />

      <ConfirmModal
        show={showModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta categoria?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <AlertModal
        show={showAlert}
        title="Atenção"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}
