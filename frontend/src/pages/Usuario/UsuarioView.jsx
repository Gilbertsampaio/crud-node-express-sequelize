import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Button from "../../components/common/Button";
import { FaHome, FaEdit, FaUsers } from "react-icons/fa";
import './UsuarioView.css';

export default function UsuarioViewPage() {

    const { id } = useParams(); // pode ser undefined se for perfil
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState("");

    const handleEdit = (id) => navigate(`/usuarios/editar/${id}`);

    const fetchUsuario = async () => {
        try {
            const endpoint = id ? `/users/${id}` : `/users/me/`; // se não tiver id, pega perfil
            const res = await api.get(endpoint);
            setUsuario(res.data);
        } catch (err) {
            console.error(err);
            setError("Erro ao buscar usuário: " + (err.response?.data?.message || err.message));
        }
    };

    useEffect(() => {
        fetchUsuario();
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!usuario) return <p>Carregando...</p>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>{id ? "Visualizar Usuário" : "Meu Perfil"}</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button className="btn-primary" onClick={() => navigate(id ? "/usuarios" : "/")}>
                        <FaHome />
                    </Button>
                    <Button className="btn-primary" onClick={() => navigate(id ? handleEdit(id) : `/perfil/editar`)}>
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
