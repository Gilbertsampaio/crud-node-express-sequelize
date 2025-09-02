import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import './UsuarioList.css';

export default function UsuarioList() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const location = useLocation();

  const fetchUsuarios = async () => {
    try {
      const [resUsuarios] = await Promise.all([
        api.get('/users')
      ]);
      setUsuarios(resUsuarios.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar dados: ' + err.message);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Captura o ?success=1 da URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('success') === '1') {
      setSuccessMessage('Usuário criado com sucesso!');
      // limpa o parâmetro da URL para não repetir
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' }
  ];

  return (
    <div className="container">
      <h2>Lista de Usuários</h2>

      {successMessage && <p className="success">{successMessage}</p>}
      {error ? (
        <p className="error">{error}</p>
      ) : usuarios.length > 0 ? (
        <Table columns={columns} data={usuarios} />
      ) : (
        <p>Ainda não existem usuários cadastrados.</p>
      )}
    </div>
  )
}
