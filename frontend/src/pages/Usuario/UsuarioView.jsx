import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Button from "../../components/common/Button";
import { FaHome, FaEdit, FaUsers } from "react-icons/fa";
import LoadingModal from "../../components/common/LoadingModal";
import './UsuarioView.css';

export default function UsuarioViewPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState('');
    // const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const handleEdit = () => navigate(id ? `/usuarios/editar/${id}` : `/perfil/editar`);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                setLoading(true);
                const endpoint = id ? `/users/${id}` : `/users/me/`;
                const res = await api.get(endpoint);
                setUsuario(res.data);
                // setSuccessMessage('Dados do Usuário exibidos com sucesso!');
            } catch (err) {
                console.error(err);
                if (err.response.data.error === 'logout') {
                    setError(err.response.data.error);
                } else {
                    setError("Erro ao buscar dados do usuário: " + (err.response?.data?.message || err.message));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [id]);

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>{id ? "Visualizar Usuário" : "Meu Perfil"}</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button className="btn-primary" onClick={() => navigate(id ? "/usuarios" : "/")}>
                        <FaHome />
                    </Button>
                    <Button className="btn-primary" onClick={handleEdit}>
                        <FaEdit />
                    </Button>
                </div>
            </div>

            {/* {successMessage && <p className="success">{successMessage}</p>} */}
            {error && error !== 'logout' && <p className="error">{error}</p>}

            <div className="card-container">
                <div className="card">
                    <FaUsers size={40} />
                    <h3>Nome: <span>{usuario?.name ? usuario?.name : 'Indisponível'}</span></h3>
                    <p>Email: <span>{usuario?.email ? usuario?.email : 'Indisponível'}</span></p>
                </div>
            </div>

            {loading && (
                <LoadingModal show={loading} />
            )}
        </div>
    );
}
