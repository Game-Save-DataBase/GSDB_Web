import React, { useEffect, useRef, useCallback } from 'react';

function FilterBar({ data, filters, onFilteredChange }) {
  const filterRefs = useRef([]);

  const applyFilters = useCallback(() => {
    let result = [...data];

    filterRefs.current.forEach(ref => {
      if (ref?.getPredicate) {
        const predicate = ref.getPredicate();
        result = result.filter(predicate);
      }
    });

    onFilteredChange(result);
  }, [data, onFilteredChange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters, filters]);

  const setFilterRef = (el, idx) => {
    filterRefs.current[idx] = el;
  };

  return (
    <div className="filter-bar mb-3">
      {/* Encapsulamos los filtros en un contenedor con scroll */}
      <div
        className="p-2 border rounded bg-light"
        style={{
          overflowX: 'auto',   // para scroll horizontal si hay overflow
          display: 'flex',     // flex container
          flexDirection: 'row',
          gap: '8px',          // opcional: separa los filtros horizontalmente
          alignItems: 'center' // opcional: centra verticalmente los filtros
        }}
      >        {filters.map((FilterComponent, idx) => (
        <FilterComponent.type
          key={idx}
          ref={el => setFilterRef(el, idx)}
          {...FilterComponent.props}
          onChange={applyFilters}
        />
      ))}
      </div>
    </div>
  );
}

export default FilterBar;
