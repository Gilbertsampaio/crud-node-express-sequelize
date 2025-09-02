import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import { FaUsers, FaCog } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Bem-vindo ao Sistema</h1>
      <p>Use o menu acima para gerenciar Usuários e Serviços.</p>

      <div className="card-container" style={{ display: 'flex', gap: '20px' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/usuarios')}>
          <Card 
            title="Usuários"
            description="Visualize, adicione ou edite usuários cadastrados."
            icon={<FaUsers size={40} style={{ marginBottom: '10px' }} />}
          />
        </div>

        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/servicos')}>
          <Card 
            title="Serviços"
            description="Gerencie os serviços disponíveis e suas informações."
            icon={<FaCog size={40} style={{ marginBottom: '10px' }} />}
          />
        </div>
      </div>
    </div>
  );
}
