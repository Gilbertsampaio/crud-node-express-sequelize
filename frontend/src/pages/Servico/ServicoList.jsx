import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaTrash, FaHome } from 'react-icons/fa';
import './ServicoList.css';
import ConfirmModal from '../../components/common/ConfirmModal';

// ... imports permanecem iguais

export default function ServicoListPage() {
  const [servicos, setServicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]); // <-- novo state
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchServicos = async () => {
    try {
      const [resServicos, resUsuarios, resCategorias] = await Promise.all([
        api.get('/services'),
        api.get('/users'),
        api.get('/categories') // <-- buscar categorias
      ]);
      setServicos(resServicos.data);
      setUsuarios(resUsuarios.data);
      setCategorias(resCategorias.data); // <-- salvar categorias
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar dados: ' + err.message);
    }
  };

  useEffect(() => { fetchServicos(); }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const getUserName = (id) => {
    const user = usuarios.find(u => u.id === id);
    return user ? user.name : 'Usuário não encontrado';
  };

  const getCategoryName = (id) => { // <-- nova função
    const cat = categorias.find(c => c.id === id);
    return cat ? cat.name : 'Categoria não definida';
  };

  const handleEdit = (id) => navigate(`/servicos/editar/${id}`);
  const handleNew = () => navigate('/servicos/novo');
  const handleHome = () => navigate('/');

  const handleDeleteClick = (id) => {
    setSelectedServiceId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/services/${selectedServiceId}`);
      setSuccessMessage('Serviço excluído com sucesso!');
      fetchServicos();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir serviço: ' + err.message);
    } finally {
      setShowModal(false);
      setSelectedServiceId(null);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedServiceId(null);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição' },
    { key: 'user', label: 'Usuário' },
    { key: 'category', label: 'Categoria' }, // <-- nova coluna
    {
      key: 'actions',
      label: 'Ações',
      render: (service) => (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
          <Button className="action" onClick={() => handleEdit(service.id)}>
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

  const data = servicos.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    user: getUserName(s.userId),
    category: getCategoryName(s.categoryId), // <-- incluir categoria
    actions: s
  }));

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>Lista de Serviços</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={handleHome}>
            <FaHome style={{ marginRight: '5px' }} /> Home
          </Button>
          <Button className="btn-success" onClick={handleNew}>
            <FaPlus />
          </Button>
        </div>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error">{error}</p>}

      <Table columns={columns} data={data} />

      <ConfirmModal
        show={showModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este serviço?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
