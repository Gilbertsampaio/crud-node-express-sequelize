import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaSave, FaTimes, FaPlus, FaEdit } from 'react-icons/fa';

export default function ServicoForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [categoryId, setCategoryId] = useState(''); // <- renomeado
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  // Buscar usuários
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await api.get('/users');
        setUsuarios(res.data);
      } catch {
        setError('Erro ao buscar usuários.');
      }
    }
    fetchUsuarios();
  }, []);

  // Buscar categorias
  useEffect(() => {
    async function fetchCategorias() {
      try {
        const res = await api.get('/categories');
        setCategorias(res.data);
      } catch {
        setError('Erro ao buscar categorias.');
      }
    }
    fetchCategorias();
  }, []);

  // Carregar serviço se houver id
  useEffect(() => {
    if (id) {
      api.get(`/services/${id}`)
        .then(res => {
          setTitle(res.data.title);
          setDescription(res.data.description);
          setUserId(res.data.userId);
          setCategoryId(res.data.categoryId || ''); // <- ajustado
        })
        .catch(() => setError('Erro ao carregar serviço.'));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !userId || !categoryId) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const payload = { title, description, userId, categoryId }; // <- ajustado
      if (id) {
        await api.put(`/services/${id}`, payload);
        navigate('/servicos', { state: { successMessage: 'Serviço atualizado com sucesso!' } });
      } else {
        await api.post('/services', payload);
        navigate('/servicos', { state: { successMessage: 'Serviço criado com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao salvar serviço.');
    }
  };

  const handleCancel = () => navigate('/servicos');

  return (
    <div className="service-form-container">
      <h2>
        {id ? <FaEdit size={18} style={{ marginRight: '5px' }} /> : <FaPlus size={18} style={{ marginRight: '5px' }} />}
        {id ? 'Editar Serviço' : 'Novo Serviço'}
      </h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Digite o título do serviço"
        />

        <label>Descrição</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Digite a descrição"
          rows="4"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            border: '1px solid #ccc',
            resize: 'vertical'
          }}
        />

        <label>Usuário</label>
        <select
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        >
          <option value="">Selecione um usuário</option>
          {usuarios.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <label>Categoria</label>
        <select
          value={categoryId} // <- ajustado
          onChange={e => setCategoryId(e.target.value)} // <- ajustado
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <Button className="btn-danger" type="button" onClick={handleCancel}>
            <FaTimes style={{ marginRight: '5px' }} />
            Cancelar
          </Button>
          <Button type="submit">
            <FaSave style={{ marginRight: '5px' }} />
            {id ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
