import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
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

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição' },
    { key: 'user', label: 'Usuário' },
    {
      key: 'actions',
      label: 'Ações',
      render: (service) => (
        <Button onClick={() => handleEdit(service.id)}>Editar</Button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Lista de Serviços</h2>
        <Button onClick={handleNew}>Novo Serviço</Button>
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
