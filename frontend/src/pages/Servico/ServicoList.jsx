import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import './ServicoList.css';

export default function ServicoListPage() {
  const [servicos, setServicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const location = useLocation();

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

  useEffect(() => {
    fetchServicos();
  }, []);

  // Captura o ?success=1 da URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('success') === '1') {
      setSuccessMessage('Serviço criado com sucesso!');
      // limpa o parâmetro da URL para não repetir
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const getUserName = (id) => {
    const user = usuarios.find(u => u.id === id);
    return user ? user.name : 'Usuário não encontrado';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição' },
    { key: 'user', label: 'Usuário' }
  ];

  const data = servicos.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    user: getUserName(s.userId)
  }));

  return (
    <div className="container">
      <h2>Lista de Serviços</h2>

      {successMessage && <p className="success">{successMessage}</p>}
      {error ? (
        <p className="error">{error}</p>
      ) : servicos.length > 0 ? (
        <Table columns={columns} data={data} />
      ) : (
        <p>Ainda não existem serviços cadastrados.</p>
      )}
    </div>
  );
}
