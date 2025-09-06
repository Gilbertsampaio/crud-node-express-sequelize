// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AlertModal from '../components/common/AlertModal';
import LoadingModal from '../components/common/LoadingModal';
import './ResetPassword.css';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setAlertMessage('Link inválido. Retorne à página de login.');
            setShowAlert(true);
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError('Preencha todos os campos.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/reset-password', { email, token, newPassword: password });

            setLoading(false);
            setAlertMessage('Senha redefinida com sucesso!<br><br>Faça login novamente.');
            setShowAlert(true);

            // Limpa campos
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            setLoading(false);
            setPassword('');
            setConfirmPassword('');
            setError(err.response?.data?.error || 'Erro ao redefinir senha.');
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Redefinir senha</h2>
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <Input
                    label="Nova senha"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                />
                <Input
                    label="Confirmar nova senha"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                />
                <div style={{ marginTop: '5px', marginBottom: '15px', fontSize: '14px' }}>
                    <label style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            style={{ marginRight: '5px' }}
                        />
                        Mostrar senhas
                    </label>
                </div>
                <Button type="submit">Redefinir senha</Button>
            </form>

            <div className="link-reset">
                <a onClick={() => navigate('/login')}>Voltar ao login</a>
            </div>

            <LoadingModal show={loading} />

            <AlertModal
                show={showAlert}
                title="Atenção"
                message={alertMessage}
                onClose={() => {
                    setShowAlert(false);
                    // se a senha foi redefinida, redireciona para login
                    if (alertMessage.includes('sucesso')) {
                        navigate('/login');
                    }
                }}
            />
        </div>
    );
}
