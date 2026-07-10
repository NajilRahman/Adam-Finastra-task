import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ meta, onPageChange }) => {
  const { page, pages, total, limit } = meta;

  if (pages <= 1) return null;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <span>{startIdx}</span> to <span>{endIdx}</span> of <span>{total}</span> entries
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        <div className="pagination-pages">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
            // Simple logic to show current, adjacent pages
            const isCurrent = p === page;
            const isNear = Math.abs(p - page) <= 1 || p === 1 || p === pages;

            if (!isNear) {
              if (p === 2 || p === pages - 1) {
                return <span key={p} className="pagination-ellipsis">...</span>;
              }
              return null;
            }

            return (
              <button
                key={p}
                className={`pagination-page-number ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          className="pagination-btn"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
