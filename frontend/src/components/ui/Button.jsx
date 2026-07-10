import React from 'react';

/**
 * Reusable Button Component matching the enterprise theme
 */
const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, danger, outline
  loading = false, 
  disabled = false, 
  type = 'button', 
  onClick, 
  className = '', 
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const combinedClasses = `${baseClass} ${variantClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg 
          className="btn-spinner" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          style={{ 
            display: 'inline-block', 
            width: '1em', 
            height: '1em', 
            marginRight: '8px', 
            verticalAlign: 'middle',
            animation: 'spin 1s linear infinite'
          }}
        >
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
