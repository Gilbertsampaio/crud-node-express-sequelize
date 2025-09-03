import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Button from "../../components/common/Button";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import './UsuarioView.css';

export default function UsuarioViewPage() {
    const { id } = useParams(); // pode ser undefined se for perfil
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState("");

    const handleEdit = (id) => navigate(`/usuarios/editar/${id}`);

    const fetchUsuario = async () => {
        try {
            const endpoint = id ? `/users/${id}` : `/users/me`; // se não tiver id, pega perfil
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
        <div className="container usuario-view">
            <div className="header">
                <h2>{id ? "Visualizar Usuário" : "Meu Perfil"}</h2>
                <div className="actions">
                    <Button onClick={() => navigate(id ? "/usuarios" : "/")}>
                        <FaArrowLeft style={{ marginRight: "5px" }} /> Voltar
                    </Button>
                    <Button onClick={() => navigate(id ? handleEdit(id) : `/perfil/editar`)}>
                        <FaEdit style={{ marginRight: "5px" }} /> Editar
                    </Button>
                </div>
            </div>

            <div className="usuario-details">
                <div>
                    <strong>Nome:</strong> <span>{usuario.name}</span>
                </div>
                <div>
                    <strong>Email:</strong> <span>{usuario.email}</span>
                </div>
                {/* Adicione mais campos caso existam */}
            </div>
        </div>
    );
}
