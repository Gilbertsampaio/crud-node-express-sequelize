import { useState, useRef } from 'react';
import api from '../../api/api';
import { useLocation, Link } from 'react-router-dom';
import { FaBars, FaSignOutAlt, FaUsers, FaCogs, FaListOl, FaHome, FaUser, FaUserCog, FaNewspaper, FaRegPlayCircle, FaCamera } from 'react-icons/fa';
import NavBar from '../../components/common/NavBar';
import Footer from '../../components/common/Footer';
import ConfirmModal from "./ConfirmModal";
import useAuth from "../../context/useAuth";
import LoadingModal from '../../components/common/LoadingModal';
import './Layout.css';
import AlertModal from '../../components/common/AlertModal';

export default function Layout({ children, menuPosition = 'top' }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
    const { user, logout, loading, updateUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const fileInputRef = useRef(null);

    if (loading) return <LoadingModal show={true} />;

    const handleLogoutClick = () => setShowModal(true);
    const confirmLogout = () => { logout(); setShowModal(false); };
    const cancelLogout = () => setShowModal(false);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {

            const res = await api.put(`/users/${user.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.image) {
                updateUser({ image: res.data.image });
            } else {
                setShowAlert(true);
                setAlertMessage('Erro ao atualizar imagem');
                throw new Error('Erro ao atualizar imagem');
            }

        } catch (err) {
            console.error(err);
            setShowAlert(true);
            setAlertMessage('Falha ao atualizar a imagem');
        }
    };

    const menuItems = [
        { label: 'Home', path: '/', icon: <FaHome size={14} /> },
        { label: 'Usuários', path: '/usuarios', icon: <FaUsers size={14} /> },
        { label: 'Serviços', path: '/servicos', icon: <FaCogs size={14} /> },
        { label: 'Categorias', path: '/categorias', icon: <FaListOl size={14} /> },
        { label: 'Novidades', path: '/news', icon: <FaNewspaper size={14} /> },
        { label: 'Stories', path: '/stories', icon: <FaRegPlayCircle size={14} /> },
        { label: 'Perfil', path: '/perfil', icon: <FaUser size={14} /> },
        { label: 'Meus Serviços', path: '/meus-servicos', icon: <FaUserCog size={14} /> },
    ];

    const avatarUrl = user?.image ? `${API_URL}/uploads/${user.image}` : "/images/avatar.png";

    return (
        <div className={`layout ${menuPosition}`}>
            {menuPosition === 'side' && (
                <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        {!collapsed && (
                            <div
                                className="user-avatar-side"
                                style={{ backgroundImage: `url(${avatarUrl})` }}
                                onClick={handleAvatarClick}
                            >
                                <div className="avatar-overlay">
                                    <FaCamera size={18} />
                                </div>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <button
                            className="toggle-btn"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <FaBars />
                        </button>
                    </div>

                    {!collapsed && (
                        <nav>
                            {menuItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <span style={{ marginRight: '8px' }}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                onClick={handleLogoutClick}
                                className="sidebar-link"
                            >
                                <FaSignOutAlt size={14} style={{ marginRight: '8px' }} />
                                Sair do Sistema
                            </Link>
                        </nav>
                    )}
                </aside>
            )}

            <div className="main-content">
                {menuPosition === 'top' && <NavBar />}
                <main>{children}</main>
                <Footer />
            </div>

            <ConfirmModal
                show={showModal}
                title="Confirmar saída"
                message="Tem certeza que deseja sair do sistema?"
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
            />

            <AlertModal
                show={showAlert}
                title="Alteração de Imagem"
                message={alertMessage}
                onClose={() => setShowAlert(false)}
            />
        </div>
    );
}
