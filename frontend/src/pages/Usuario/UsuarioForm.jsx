import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaSave, FaTimes } from 'react-icons/fa';

export default function UsuarioForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  // Carregar dados do usuário se houver id
  useEffect(() => {
    if (id) {
      api.get(`/users/${id}`)
        .then(res => {
          setNome(res.data.name);
          setEmail(res.data.email);
        })
        .catch(error => {
          console.error(error);
          if (error.response && error.response.status === 404) {
            setError('Usuário não encontrado.');
          } else {
            setError('Erro ao carregar usuário.');
          }
        });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios.');
      return;
    }

    try {
      if (id) {
        await api.put(`/users/${id}`, { name: nome, email });
        navigate('/usuarios', { state: { successMessage: 'Usuário atualizado com sucesso!' } });
      } else {
        await api.post('/users', { name: nome, email });
        navigate('/usuarios', { state: { successMessage: 'Usuário criado com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.join(', '));
      } else if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao salvar usuário.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/usuarios'); // volta para a listagem
  };

  return (
    <div className="container">
      <h2>{id ? 'Editar Usuário' : 'Novo Usuário'}</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome do usuário"
          error={error}
        />
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o email do usuário"
          error={error}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <Button type="submit">
            <FaSave style={{ marginRight: '5px' }} />
            {id ? 'Atualizar' : 'Salvar'}
          </Button>
          <Button type="button" onClick={handleCancel} style={{ backgroundColor: '#ccc', color: '#000' }}>
            <FaTimes style={{ marginRight: '5px' }} />
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
