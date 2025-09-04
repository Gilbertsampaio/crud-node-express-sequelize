import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavBar from '../../components/common/NavBar';
import { FaBars, FaSignOutAlt, FaUsers, FaCogs, FaListOl, FaHome, FaUser, FaUserCog } from 'react-icons/fa';
import './Layout.css';
import Footer from '../../components/common/Footer';
import ConfirmModal from "./ConfirmModal";
import useAuth from "../../context/useAuth";

export default function Layout({ children, menuPosition = 'top' }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
    const { user, logout } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const handleLogoutClick = () => setShowModal(true);
    const confirmLogout = () => {
        logout();
        setShowModal(false);
    };
    const cancelLogout = () => setShowModal(false);

    const menuItems = [
        { label: 'Home', path: '/', icon: <FaHome size={14} /> },
        { label: 'Usuários', path: '/usuarios', icon: <FaUsers size={14} /> },
        { label: 'Serviços', path: '/servicos', icon: <FaCogs size={14} /> },
        { label: 'Categorias', path: '/categorias', icon: <FaListOl size={14} /> },
        { label: 'Perfil', path: '/perfil', icon: <FaUser size={14} /> },
        { label: 'Meus Serviços', path: '/meus-servicos', icon: <FaUserCog size={14} /> },
    ];

    const avatarUrl = user?.image
        ? `${API_URL}/uploads/${user.image}`
        : "/images/avatar.png";

    return (
        <div className={`layout ${menuPosition}`}>
            {menuPosition === 'side' && (
                <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        {!collapsed && (
                            <img
                                src={avatarUrl}
                                alt="Avatar do usuário"
                                className="user-avatar"
                                onError={(e) => { e.currentTarget.src = "/images/avatar.png"; }}
                            />
                        )}
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
        </div>
    );
}
