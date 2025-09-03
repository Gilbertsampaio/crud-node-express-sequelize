// src/components/common/Footer.jsx
import { useState } from 'react';
import '../../assets/styles.css';
import AlertModal from '../../components/common/AlertModal';

export default function Footer() {
    const [showAlert, setShowAlert] = useState(false);

    const githubLink = import.meta.env.VITE_GITHUB_URL || '#';
    const linkedinLink = import.meta.env.VITE_LINKEDIN_URL || '#';
    const whatsappLink = import.meta.env.VITE_WHATSAPP_URL || '#';

    const alertMessage = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <a style={{ textDecoration: 'none', color: '#333' }} href={githubLink} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a style={{ textDecoration: 'none', color: '#333' }} href={linkedinLink} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a style={{ textDecoration: 'none', color: '#333' }} href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
    );

    return (
        <footer className="footer">
            <div className="footer-container">
                <p>
                    Desenvolvido por{' '}
                    <a
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#333',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                        onClick={() => setShowAlert(true)}
                    >
                        Gilbert Sampaio
                    </a>{' '}
                    - © {new Date().getFullYear()} Meu Sistema. Todos os direitos reservados.
                </p>
            </div>

            <AlertModal
                show={showAlert}
                title="Redes Sociais"
                message={alertMessage}
                onClose={() => setShowAlert(false)}
            />
        </footer>
    );
}
