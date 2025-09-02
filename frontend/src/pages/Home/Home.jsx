import Card from '../../components/common/Card';

export default function Home() {
  return (
    <div className="container">
      <h1>Bem-vindo ao Sistema</h1>
      <p>Use o menu acima para gerenciar Usuários e Serviços.</p>

      <div className="card-container">
        <Card 
          title="Usuários"
          description="Visualize, adicione ou edite usuários cadastrados."
        />
        <Card 
          title="Serviços"
          description="Gerencie os serviços disponíveis e suas informações."
        />
      </div>
    </div>
  );
}
