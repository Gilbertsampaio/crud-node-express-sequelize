import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaTrash, FaHome, FaCogs, FaUserCog } from 'react-icons/fa';
import ConfirmModal from '../../components/common/ConfirmModal';
import useAuth from "../../context/useAuth";
import './ServicoList.css';

export default function ServicoList({ tipo }) {
  const [servicos, setServicos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const { user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const fetchServicos = useCallback(async () => {
    try {
      const endpoint = tipo === "meus" ? `/services/my/${user.id}` : "/services";
      const [resServicos, resCategorias, resUsuarios] = await Promise.all([
        api.get(endpoint),
        api.get("/categories"),
        api.get("/users")
      ]);
      setServicos(resServicos.data);
      setCategorias(resCategorias.data);
      setUsuarios(resUsuarios.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar dados: " + err.message);
    }
  }, [tipo, user.id]);

  useEffect(() => { fetchServicos(); }, [fetchServicos]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const getCategoryName = (id) => {
    const cat = categorias.find(c => c.id === id);
    return cat ? cat.name : 'Categoria não definida';
  };

  const getUserName = (id) => {
    const u = usuarios.find(u => u.id === id);
    return u ? u.name : 'Usuário não encontrado';
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
    { key: 'category', label: 'Categoria' },
    { key: 'userName', label: 'Criador' },
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

  const data = servicos.map(s => ({
    id: s.id,
    title: (
      <span style={{ whiteSpace: "nowrap"}}>
        {s.title}
      </span>
    ),
    description: s.description,
    category: (
      <span style={{ whiteSpace: "nowrap" }}>
        {getCategoryName(s.categoryId)}
      </span>
    ),
    userName: (
      <span style={{ whiteSpace: "nowrap" }}>
        {getUserName(s.userId)}
      </span>
    ),
    actions: s
  }));

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>
          <span style={{ marginRight: '8px' }}>{tipo === "meus" ? <FaUserCog /> : <FaCogs />}</span>
          {tipo === "meus" ? "Meus Serviços" : "Todos os Serviços"}
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

      <Table columns={columns} data={data} emptyMessage="Nenhum registro encontrado." />

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
