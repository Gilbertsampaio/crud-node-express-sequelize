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
    const [ setError] = useState("");
    const [loading, setLoading] = useState(true);

    const handleEdit = () => navigate(id ? `/usuarios/editar/${id}` : `/perfil/editar`);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                setLoading(true);
                const endpoint = id ? `/users/${id}` : `/users/me/`;
                const res = await api.get(endpoint);
                setUsuario(res.data);
            } catch (err) {
                console.error(err);
                setError("Erro ao buscar usuário: " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [id]);

    if (loading) return <LoadingModal show={loading} />;

    // if (error) return <p className="error">{error}</p>;

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

            <div className="card-container">
                <div className="card">
                    <FaUsers size={40} />
                    <h3>Nome: <span>{usuario.name}</span></h3>
                    <p>Email: <span>{usuario.email}</span></p>
                </div>
            </div>
        </div>
    );
}
