interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible?: () => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  /** Sign Up's confirm-password field has no toggle button of its own —
   * it just follows the password field's visibility state. */
  showToggleButton?: boolean;
}

function PasswordInput({
  id,
  name,
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
  autoComplete,
  required,
  showToggleButton=true,
}: PasswordInputProps) {
  return (
    <>
    <div className="form-input-wrapper">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        className="form-input"
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showToggleButton && onToggleVisible && (
        <button
          type="button"
          className="input-toggle-btn"
          onClick={onToggleVisible}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          <i className={visible ? "ph ph-eye-slash" : "ph ph-eye"} />
        </button>
      )}
    </div>
    </>
  );
}

export default PasswordInput