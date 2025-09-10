// src/components/common/Select.jsx
import './Form.css';

export default function Select({ label, value, onChange, options = [], placeholder = "Selecione", error = "" }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <select value={value} onChange={onChange} className={error ? "error" : ""}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
