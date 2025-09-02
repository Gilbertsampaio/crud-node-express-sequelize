import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function UsuarioForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação básica
    if (!nome.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios.');
      return;
    }

    try {
      await api.post('/users', { name: nome, email });
      setNome('');
      setEmail('');
      setError('');
      navigate('/usuarios?success=1', { state: { successMessage: 'Usuário criado com sucesso!' } });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.join(', '));
      } else if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao criar usuário.');
      }
    }
  };

  return (
    <div className="container">
      <h2>Novo Usuário</h2>
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
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  );
}
