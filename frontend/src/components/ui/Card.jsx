import React from 'react';

/**
 * Reusable Card component for UI panels and dashboards
 */
const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div className={`enterprise-card ${className}`.trim()} {...props}>
      {(title || subtitle || actions) && (
        <div 
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '12px'
          }}
        >
          <div>
            {title && <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>{title}</h2>}
            {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
