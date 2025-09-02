import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaHome } from 'react-icons/fa';
import './ServicoList.css';

export default function ServicoListPage() {
  const [servicos, setServicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const fetchServicos = async () => {
    try {
      const [resServicos, resUsuarios] = await Promise.all([
        api.get('/services'),
        api.get('/users')
      ]);
      setServicos(resServicos.data);
      setUsuarios(resUsuarios.data);
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

  const handleEdit = (id) => navigate(`/servicos/editar/${id}`);
  const handleNew = () => navigate('/servicos/novo');
  const handleHome = () => navigate('/');

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição' },
    { key: 'user', label: 'Usuário' },
    {
      key: 'actions',
      label: 'Ações',
      render: (service) => (
        <Button onClick={() => handleEdit(service.id)}>
          <FaEdit style={{ marginRight: '5px' }} /> Editar
        </Button>
      )
    }
  ];

  const data = servicos.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    user: getUserName(s.userId),
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
          <Button onClick={handleNew}>
            <FaPlus style={{ marginRight: '5px' }} /> Novo Serviço
          </Button>
        </div>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error">{error}</p>}

      {servicos.length > 0 ? (
        <Table columns={columns} data={data} />
      ) : (
        <p>Ainda não existem serviços cadastrados.</p>
      )}
    </div>
  );
}
