import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AuthContext from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email e senha são obrigatórios.');
      return;
    }

    try {
      const res = await api.post('/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      login({ ...user, token }); // salva no contexto e localStorage

      navigate('/'); // redireciona para home
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Digite seu email"
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Digite sua senha"
        />
        <Button type="submit">Entrar</Button>
      </form>
    </div>
  );
}
