// src/pages/NewsForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import FileInput from '../../components/common/FileInput';
import Button from '../../components/common/Button';
import LoadingModal from '../../components/common/LoadingModal';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ImageModal from '../../components/common/ImageModal';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';

export default function NewsForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resetFileInput, setResetFileInput] = useState(false);
  const [fileInputTitle, setFileInputTitle] = useState("Escolher Arquivo");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

  const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
  const closeImageModal = () => setSelectedImage(null);

  // Buscar usuários e categorias
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resUsers, resCategories] = await Promise.all([
          api.get('/users'),
          api.get('/categories')
        ]);
        setUsers(resUsers.data);
        setCategories(resCategories.data);
      } catch (err) {
        console.error(err);
        setError('Erro ao buscar usuários ou categorias.');
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Carregar novidade se editar
  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/news/${id}`)
        .then(res => {
          const n = res.data;
          setTitle(n.title);
          setDescription(n.description);
          setCategoryId(n.categoryId);
          setUserId(n.userId);
          if (n.image) {
            setPreview(`${API_URL}/uploads/${n.image}`);
            setFileInputTitle(n.image);
          }
          setExternalUrl(n.externalUrl || '');
        })
        .catch(() => setError('Erro ao carregar novidade.'))
        .finally(() => setLoading(false));
    }
  }, [id, API_URL]);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setFileInputTitle("Escolher Arquivo");
    setRemoveExistingImage(true);
    setResetFileInput(true);
    setTimeout(() => setResetFileInput(false), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !categoryId || !userId) {
      setError('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    if ((!id && !image) || (id && !image && removeExistingImage && !preview)) {
      setError('A imagem da novidade é obrigatória.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('userId', userId);
    formData.append('externalUrl', externalUrl);
    if (image) formData.append('image', image);
    if (removeExistingImage) formData.append('removeImage', 'true');

    try {
      if (id) {
        await api.put(`/news/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/news');
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar novidade.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/news');
  };

  return (
    <div className="new-form-container">
      <LoadingModal show={loading} />

      <h2>{id ? <FaEdit /> : <FaPlus />} {id ? 'Editar Novidade' : 'Nova Novidade'}</h2>

      {error && error !== 'logout' && error !== 'Todos os campos obrigatórios devem ser preenchidos.' && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>

        <div className="form-row">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título da novidade"
            error={error}
          />
          <Select
            label="Categoria"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            error={error}
          />
        </div>

        <div className="form-row mb-0">
          <Select
            label="Usuários"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            options={users.map(u => ({ value: u.id, label: u.name }))}
            error={error}
          />
          <FileInput
            label="Imagem da Novidade"
            titulo={fileInputTitle}
            onChange={handleFileChange}
            accept="image/*"
            error={error}
            reset={resetFileInput}
          />
        </div>

        {preview && (
          <div className="form-row mb-0">
            <div className="input-group preview-container">
              <img
                src={preview}
                alt="Pré-visualização"
                className="img-preview"
                onClick={() => openImageModal(preview)}
                onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="100%" height="100%" fill="%23eee"/></svg>'; }}
              />
              {!id && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                  title="Remover imagem"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="form-row mb-0">
          <Input label="URL Externa (opcional)" value={externalUrl} onChange={e => setExternalUrl(e.target.value)} />
        </div>

        <div className="form-row mb-0">
          <Textarea
            label="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Digite a descrição da novidade"
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

      <ImageModal
        show={!!selectedImage}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />
    </div>
  );
}
