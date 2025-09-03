import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaSave, FaTimes } from 'react-icons/fa';

export default function UsuarioForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // id de outro usuário
  const location = useLocation();

  const isPerfil = location.pathname === '/perfil/editar';

  useEffect(() => {
    if (id || isPerfil) {
      const endpoint = id ? `/users/${id}` : `/users/me`;
      api.get(endpoint)
        .then(res => {
          setNome(res.data.name);
          setEmail(res.data.email);
        })
        .catch(err => {
          console.error(err);
          setError(err.response?.status === 404 ? 'Usuário não encontrado.' : 'Erro ao carregar usuário.');
        });
    }
  }, [id, isPerfil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios.');
      return;
    }

    const payload = { name: nome, email };
    if (senha.trim()) payload.password = senha;

    try {
      if (id) {
        // editar outro usuário
        await api.put(`/users/${id}`, payload);
        navigate('/usuarios', { state: { successMessage: 'Usuário atualizado com sucesso!' } });
      } else if (isPerfil) {
        // editar próprio perfil
        await api.put('/users/me', payload);
        navigate('/', { state: { successMessage: 'Perfil atualizado com sucesso!' } });
      } else {
        // criar novo usuário
        await api.post('/users', payload);
        navigate('/usuarios', { state: { successMessage: 'Usuário criado com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Erro ao salvar usuário.');
    }
  };

  const handleCancel = () => {
    if (id) navigate('/usuarios');
    else if (isPerfil) navigate('/');
    else navigate('/usuarios');
  };

  const title = id ? 'Editar Usuário' : isPerfil ? 'Editar Meu Perfil' : 'Novo Usuário';

  return (
    <div className="user-form-container" style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h2>
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
        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder={id || isPerfil ? 'Preencha apenas se quiser alterar a senha' : 'Digite a senha'}
          error={error}
        />
        <div style={{ marginTop: '5px', marginBottom: '15px', fontSize: '14px' }}>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              style={{ marginRight: '5px' }}
            />
            Mostrar senha
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
          <Button className="btn-danger" type="button" onClick={handleCancel}>
            <FaTimes style={{ marginRight: '5px' }} /> Cancelar
          </Button>
          <Button type="submit">
            <FaSave style={{ marginRight: '5px' }} /> {id || isPerfil ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
