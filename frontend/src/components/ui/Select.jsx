import React from 'react';

/**
 * Reusable Select dropdown component matching the enterprise theme
 */
const Select = ({
  label,
  id,
  options = [], // Array of { value, label } or simple strings
  value,
  onChange,
  required = false,
  error = '',
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
      <select
        id={id}
        className="form-select"
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      >
        {options.map((opt, i) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={i} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '6px' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
