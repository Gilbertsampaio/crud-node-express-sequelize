import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AuthContext from '../context/AuthContext';
import AlertModal from '../components/common/AlertModal';
import './Login.css';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const sessionExpired = params.get('sessionExpired');

  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (sessionExpired) {
      setAlertMessage('A sessão foi encerrada por inatividade.<br><br><b>Faça o login novamente.</b>');
      setShowAlert(true);

      // Remove o query param para não abrir novamente
      const newParams = new URLSearchParams(location.search);
      newParams.delete('sessionExpired');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    }
  }, [sessionExpired, location, navigate]);

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
      login({ ...user, token });

      navigate('/');
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
      {/* Link para "Esqueceu a senha?" */}
      <div className="link-login">
        <a onClick={() => navigate('/forgot-password')}>Esqueceu a senha?</a>
      </div>
      <AlertModal
        show={showAlert}
        title="Atenção"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}
