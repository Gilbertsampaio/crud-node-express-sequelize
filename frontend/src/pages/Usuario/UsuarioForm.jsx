import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaSave, FaTimes } from 'react-icons/fa';

export default function UsuarioForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false); // toggle de exibição
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      api.get(`/users/${id}`)
        .then(res => {
          setNome(res.data.name);
          setEmail(res.data.email);
        })
        .catch(error => {
          console.error(error);
          setError(error.response?.status === 404 ? 'Usuário não encontrado.' : 'Erro ao carregar usuário.');
        });
    }
  }, [id]);

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
        await api.put(`/users/${id}`, payload);
        navigate('/usuarios', { state: { successMessage: 'Usuário atualizado com sucesso!' } });
      } else {
        await api.post('/users', payload);
        navigate('/usuarios', { state: { successMessage: 'Usuário criado com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Erro ao salvar usuário.');
    }
  };

  const handleCancel = () => navigate('/usuarios');

  return (
    <div className="user-form-container">
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
        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'} // alterna entre text e password
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder={id ? "Preencha apenas se quiser alterar a senha" : "Digite a senha"}
          error={error}
        />
        <div style={{ marginTop: '5px', marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              style={{ marginRight: '5px' }}
            />
            Mostrar senha
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <Button className="btn-danger" type="button" onClick={handleCancel}>
            <FaTimes style={{ marginRight: '5px' }} /> Cancelar
          </Button>
          <Button type="submit">
            <FaSave style={{ marginRight: '5px' }} /> {id ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
