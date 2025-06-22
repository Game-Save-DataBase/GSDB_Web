import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const FilterPlatform = forwardRef(({ platforms, disabled = [], onChange }, ref) => {
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(false);

  // Inicializa las seleccionadas con todas las plataformas habilitadas
  useEffect(() => {
    const initiallySelected = platforms
      .map(p => p.IGDB_ID)
      .filter(id => !disabled.includes(id));
    setSelected(initiallySelected);
  }, [platforms, disabled]);


  const handleToggle = (abbr) => {
    setSelected(prev =>
      prev.includes(abbr)
        ? prev.filter(p => p !== abbr)
        : [...prev, abbr]
    );
  };

  useEffect(() => {
    onChange?.();
  }, [selected, onChange]);

  useImperativeHandle(ref, () => ({
    getPredicate: () => {
      return (item) => {
        const platforms = Array.isArray(item.platformsID)
          ? item.platformsID
          : item.platformID !== undefined
            ? [item.platformID]
            : [];

        return platforms.some(p => selected.includes(p));
      };
    }

  }));


  return (
    <div className="mb-3">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setExpanded(prev => !prev)}
      >
        Platforms {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div
          className="border mt-2 p-2 rounded bg-light"
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          {platforms.map(({ IGDB_ID, name }) => {
            const isChecked = selected.includes(IGDB_ID);
            const isDisabled = disabled.includes(IGDB_ID);

            return (
              <div className="form-check" key={IGDB_ID}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`${IGDB_ID}`}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => handleToggle(IGDB_ID)}
                />
                <label className="form-check-label" htmlFor={`${IGDB_ID}`}>
                  {name}
                </label>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
});

export default FilterPlatform;
