// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AlertModal from '../components/common/AlertModal';
import LoadingModal from '../components/common/LoadingModal';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Informe seu e-mail.');
      return;
    }

    setLoading(true);

    try {
      // Envia e-mail para o backend
      await api.post('/forgot-password', { email });

      setLoading(false);

      setAlertMessage(
        'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
      );
      setShowAlert(true);
      setError('');
      setEmail('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao enviar e-mail.');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Esqueci minha senha</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu e-mail cadastrado"
        />
        <Button type="submit">Enviar link</Button>
      </form>
      <div className="link-forgot">
        <a onClick={() => navigate('/login')}>Voltar ao login</a>
      </div>
      <LoadingModal show={loading} />
      <AlertModal
        show={showAlert}
        title="Atenção"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}
