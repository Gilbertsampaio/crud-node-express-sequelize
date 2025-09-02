import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import './UsuarioList.css';

export default function UsuarioList() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'actions',
      label: 'Ações',
      render: (usuario) => (
        <Button onClick={() => handleEdit(usuario.id)}>Editar</Button>
      )
    }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Lista de Usuários</h2>
        <Button onClick={handleNew}>Novo Usuário</Button>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error">{error}</p>}

      {usuarios.length > 0 ? (
        <Table columns={columns} data={usuarios} />
      ) : (
        <p>Ainda não existem usuários cadastrados.</p>
      )}
    </div>
  );
}
