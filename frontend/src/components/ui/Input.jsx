import React from 'react';

/**
 * Reusable Input component with optional icon and error state
 */
const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  error = '',
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div className="input-with-icon" style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            size={18}
            className="input-icon"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
        )}
        <input
          id={id}
          type={type}
          className="form-input"
          style={{
            paddingLeft: Icon ? '42px' : '14px'
          }}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
      </div>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '6px' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
