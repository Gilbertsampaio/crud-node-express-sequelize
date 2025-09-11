import { useRef, useState, useEffect } from 'react';
import './FileInput.css';

const FileInput = ({ titulo = "Escolher arquivo", label, onChange, accept = "*", error, reset, maxLength = 40 }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(titulo);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      let name = file.name;
      if (name.length > maxLength) {
        const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
        name = name.slice(0, maxLength - 3 - ext.length) + '...' + ext;
      }
      setFileName(name);
      if (onChange) onChange(file);
    } else {
      setFileName(titulo);
    }
  };

  // Atualiza o fileName quando a prop 'titulo' mudar
  useEffect(() => {
    setFileName(titulo);
  }, [titulo]);

  // Reset do input quando a prop 'reset' muda
  useEffect(() => {
    if (reset) {
      fileInputRef.current.value = '';
      setFileName(titulo);
    }
  }, [reset, titulo]);

  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <div className="file-input-container">
        <label className={`file-input-label ${error ? "error" : ""}`} onClick={handleClick}>
          {fileName}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    </div>
  );
};

export default FileInput;
