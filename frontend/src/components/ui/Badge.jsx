import React from 'react';

/**
 * Reusable Badge status chip component matching status categories
 */
const Badge = ({
  children,
  status = 'scheduled', // scheduled, arrived, completed, cancelled
  className = '',
  ...props
}) => {
  const normalizedStatus = (status || 'scheduled').toLowerCase();
  const badgeClass = `badge badge-${normalizedStatus}`;
  return (
    <span className={`${badgeClass} ${className}`.trim()} {...props}>
      {children || status}
    </span>
  );
};

export default Badge;
