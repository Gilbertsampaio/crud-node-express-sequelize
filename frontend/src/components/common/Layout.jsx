import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavBar from '../../components/common/NavBar';
import { FaBars } from 'react-icons/fa';
import './Layout.css';

export default function Layout({ children, menuPosition = 'top' }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { label: 'Home', path: '/' },
        { label: 'Usuários', path: '/usuarios' },
        { label: 'Serviços', path: '/servicos' },
        { label: 'Categorias', path: '/categorias' },
    ];

    const avatarUrl = "/images/avatar.png";

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
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </aside>
            )}

            <div className="main-content">
                {menuPosition === 'top' && <NavBar />}
                <main>{children}</main>
            </div>
        </div>
    );
}
