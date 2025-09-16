// src/pages/Story/StoryForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import useAuth from "../../context/useAuth";
import Input from "../../components/common/Input";
import FileInput from "../../components/common/FileInput";
import Button from "../../components/common/Button";
import LoadingModal from "../../components/common/LoadingModal";
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import ImageModal from "../../components/common/ImageModal";
import Select from "../../components/common/Select";
import './StoryList.css';

export default function StoryForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState("image");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [resetFileInput, setResetFileInput] = useState(false);
  const [fileInputTitle, setFileInputTitle] = useState("Escolher Arquivo");
  const [removeExistingFile, setRemoveExistingFile] = useState(false);

  const openImageModal = (url) => setSelectedImage(url);
  const closeImageModal = () => setSelectedImage(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";

  // Carregar story se for edição
  useEffect(() => {

    if (id) {
      const fetchCategoria = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/stories/${id}`);
          console.log(res)
          setType(res.data.type);
          setTitle(res.data.title || '');
          if (res.data.media_url) {
            setPreview(`${API_URL}/uploads/${res.data.media_url}`);
            setFileInputTitle(res.data.media_url);
          }
        } catch (err) {
          console.error(err);
          if (err.response.data.error === 'logout') {
            setError(err.response.data.error);
          } else {
            setError(err.response?.status === 404 ? 'Storie não encontrado.' : 'Erro ao carregar storie.');
          }
        } finally {
          setTimeout(() => setLoading(false), 0);
        }
      };
      fetchCategoria();
    }
  }, [id, API_URL]);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setFileInputTitle("Escolher Arquivo");
    setRemoveExistingFile(true);
    setResetFileInput(true);
    setTimeout(() => setResetFileInput(false), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title && type === "image" && !file && !preview) {
      setError("Título ou arquivo é obrigatório.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("title", title);
    formData.append("type", type);
    if (file) formData.append("media", file);
    if (removeExistingFile) formData.append("removeMedia", "true");

    try {
      if (id) {
        await api.put(`/stories/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/stories", formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/stories");
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar story.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/stories");

  return (
    <div className="storie-form-container">
      <LoadingModal show={loading} />

      <h2>{id ? <FaEdit /> : <FaPlus />} {id ? "Editar Story" : "Novo Story"}</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Título (opcional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título curto"
            error={error}
          />
          <Select
            label="Tipo"
            value={type}
            onChange={e => setType(e.target.value)}
            options={[
              { value: "image", label: "Imagem" },
              { value: "video", label: "Vídeo" }
            ]}
          />
        </div>

        <div className="form-row mb-0">
          <FileInput
            label="Arquivo"
            titulo={fileInputTitle}
            onChange={handleFileChange}
            accept={type === "image" ? "image/*" : "video/*"}
            error={error}
            reset={resetFileInput}
          />
        </div>

        {preview && (
          <div className="form-row mb-0">
            <div className="input-group preview-container">
              {type === "image" ? (
                <img
                  src={preview}
                  alt="Pré-visualização"
                  className="img-preview"
                  onClick={() => openImageModal(preview)}
                />
              ) : (
                <video src={preview} controls className="video-preview" />
              )}
              {!id && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveFile}
                  title="Remover arquivo"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "end" }}>
          <Button className="btn-danger" type="button" onClick={handleCancel}>
            <FaTimes style={{ marginRight: "5px" }} /> Cancelar
          </Button>
          <Button type="submit">
            <FaSave style={{ marginRight: "5px" }} /> {id ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>

      <ImageModal show={!!selectedImage} imageUrl={selectedImage} onClose={closeImageModal} />
    </div>
  );
}
