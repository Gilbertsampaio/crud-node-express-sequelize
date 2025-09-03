import './Form.css';

export default function Input({ label, value, onChange, type = "text", placeholder = "", error = "" }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? "error" : ""}
        autoComplete="new-password"
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
