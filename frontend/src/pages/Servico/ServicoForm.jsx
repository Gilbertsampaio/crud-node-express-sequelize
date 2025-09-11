// src/pages/ServicoForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingModal from '../../components/common/LoadingModal';
import { FaSave, FaTimes, FaPlus, FaEdit } from 'react-icons/fa';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';

export default function ServicoForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // Buscar usuários
  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users');
        setUsuarios(res.data);
      } catch (err) {
        console.error(err);
        if (err.response.data.error === 'logout') {
          setError(err.response.data.error);
        } else {
          setError('Erro ao buscar usuários.');
        }
      } finally {
        setTimeout(() => setLoading(false), 0);
      }
    };
    fetchUsuarios();
  }, []);

  // Buscar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      try {
        const res = await api.get('/categories');
        setCategorias(res.data);
      } catch (err) {
        console.error(err);
        if (err.response.data.error === 'logout') {
          setError(err.response.data.error);
        } else {
          setError('Erro ao buscar categorias.');
        }
      } finally {
        setTimeout(() => setLoading(false), 0);
      }
    };
    fetchCategorias();
  }, []);

  // Carregar serviço se houver id
  useEffect(() => {
    if (id) {
      const fetchServico = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/services/${id}`);
          setTitle(res.data.title);
          setDescription(res.data.description);
          setUserId(res.data.userId);
          setCategoryId(res.data.categoryId || '');
        } catch (err) {
          if (err.response.data.error === 'logout') {
            setError(err.response.data.error);
          } else {
            setError('Erro ao carregar serviço.');
          }
        } finally {
          setTimeout(() => setLoading(false), 0);
        }
      };
      fetchServico();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !userId || !categoryId) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      const payload = { title, description, userId, categoryId };
      if (id) {
        await api.put(`/services/${id}`, payload);
        navigate('/servicos', { state: { successMessage: 'Serviço atualizado com sucesso!' } });
      } else {
        await api.post('/services', payload);
        navigate('/servicos', { state: { successMessage: 'Serviço criado com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      if (err.response.data.error === 'logout') {
        setError(err.response.data.error);
      } else {
        setError(err.response?.data?.error || 'Erro ao salvar serviço.');
      }
    } finally {
      setTimeout(() => setLoading(false), 0); // delay de 2s
    }
  };

  const handleCancel = () => navigate('/servicos');

  return (
    <div className="service-form-container">
      <LoadingModal show={loading} /> {/* modal de loading acima do conteúdo */}

      <h2>
        {id ? <FaEdit size={18} style={{ marginRight: '5px' }} /> : <FaPlus size={18} style={{ marginRight: '5px' }} />}
        {id ? 'Editar Serviço' : 'Novo Serviço'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Digite o título do serviço"
            error={error}
          />
          <Select
            label="Categoria"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            options={categorias.map(c => ({ value: c.id, label: c.name }))}
            error={error}
          />
        </div>
        <div className="form-row mb-0">
          <Select
            label="Usuários"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            options={usuarios.map(u => ({ value: u.id, label: u.name }))}
            error={error}
          />
        </div>
        <div className="form-row mb-0">
          <Textarea
            label="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Digite a descrição do serviço"
            rows={4}
            error={error}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '0px', justifyContent: 'end' }}>
          <Button className="btn-danger" type="button" onClick={handleCancel}>
            <FaTimes style={{ marginRight: '5px' }} /> Cancelar
          </Button>
          <Button type="submit">
            <FaSave style={{ marginRight: '5px' }} /> {id ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
