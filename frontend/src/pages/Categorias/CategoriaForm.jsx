import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaSave, FaTimes, FaPlus, FaEdit } from 'react-icons/fa';
import LoadingModal from '../../components/common/LoadingModal';

export default function CategoriaForm() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchCategoria = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/categories/${id}`);
          setNome(res.data.name);
          setDescricao(res.data.description || '');
        } catch (err) {
          console.error(err);
          if (err.response.data.error === 'logout') {
            setError(err.response.data.error);
          } else {
            setError(err.response?.status === 404 ? 'Categoria não encontrada.' : 'Erro ao carregar categoria.');
          }
        } finally {
          setTimeout(() => setLoading(false), 0); // delay de 2 segundos
        }
      };
      fetchCategoria();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    const payload = { name: nome, description: descricao };

    setLoading(true);
    try {
      if (id) {
        await api.put(`/categories/${id}`, payload);
        navigate('/categorias', { state: { successMessage: 'Categoria atualizada com sucesso!' } });
      } else {
        await api.post('/categories', payload);
        navigate('/categorias', { state: { successMessage: 'Categoria criada com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      if (err.response.data.error === 'logout') {
        setError(err.response.data.error);
      } else {
        if (err.response?.data?.errors) setError(err.response.data.errors.join(', '));
        else if (err.response?.data?.error) setError(err.response.data.error);
        else setError('Erro ao salvar categoria.');
      }
    } finally {
      setTimeout(() => setLoading(false), 0); // delay de 2 segundos
    }
  };

  const handleCancel = () => navigate('/categorias');

  return (
    <div className="category-form-container">
      <LoadingModal show={loading} /> {/* modal de loading */}

      <h2>
        {id ? <FaEdit size={18} style={{ marginRight: '5px' }} /> : <FaPlus size={18} style={{ marginRight: '5px' }} />}
        {id ? 'Editar Categoria' : 'Nova Categoria'}
      </h2>

      {error && error !== 'logout' && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome da categoria"
          error={error}
        />
        <Input
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Digite a descrição (opcional)"
          error={error}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <Button className="btn-danger" type="button" onClick={handleCancel}>
            <FaTimes style={{ marginRight: 5 }} /> Cancelar
          </Button>
          <Button type="submit">
            <FaSave style={{ marginRight: 5 }} /> {id ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
