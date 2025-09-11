// src/components/common/Textarea.jsx
import './Form.css';

export default function Textarea({ label, value, onChange, placeholder = '', rows = 4, error = '' }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
