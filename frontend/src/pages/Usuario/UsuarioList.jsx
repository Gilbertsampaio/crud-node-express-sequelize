import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaHome } from 'react-icons/fa';
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
  const handleHome = () => navigate('/');

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'actions',
      label: 'Ações',
      render: (usuario) => (
        <Button onClick={() => handleEdit(usuario.id)}>
          <FaEdit style={{ marginRight: '5px' }} /> Editar
        </Button>
      )
    }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>Lista de Usuários</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={handleHome}>
            <FaHome style={{ marginRight: '5px' }} /> Home
          </Button>
          <Button onClick={handleNew}>
            <FaPlus style={{ marginRight: '5px' }} /> Novo Usuário
          </Button>
        </div>
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
