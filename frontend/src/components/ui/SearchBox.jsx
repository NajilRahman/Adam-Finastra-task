import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable SearchBox text field with embedded search icon
 */
const SearchBox = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  className = '',
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`search-form ${className}`.trim()} style={{ display: 'flex', gap: '12px', width: '100%' }}>
      <div className="search-input-wrap" style={{ position: 'relative', flex: 1 }}>
        <Search
          size={18}
          className="search-icon"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          className="form-input search-input"
          style={{ paddingLeft: '42px', width: '100%' }}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
      {onSearch && (
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      )}
    </form>
  );
};

export default SearchBox;
