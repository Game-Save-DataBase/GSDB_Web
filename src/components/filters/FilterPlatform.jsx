import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { getPlatformName } from '../../utils/constants';

const FilterPlatform = forwardRef(({ platforms, disabled = [], onChange }, ref) => {
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const initiallySelected = platforms.filter(p => !disabled.includes(p));
    setSelected(initiallySelected);
  }, [platforms, disabled]);

  const handleToggle = (platformID) => {
    setSelected(prev =>
      prev.includes(platformID)
        ? prev.filter(p => p !== platformID)
        : [...prev, platformID]
    );
  };

  useEffect(() => {
    onChange?.();
  }, [selected, onChange]);

  useImperativeHandle(ref, () => ({
    getPredicate: () => {
      return (item) => {
        const itemPlatforms = Array.isArray(item.platformsID) ? item.platformsID : [item.platformID];
        return itemPlatforms.some(p => selected.includes(p));
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
          {platforms.map(platformID => {
            const isChecked = selected.includes(platformID);
            const isDisabled = disabled.includes(platformID);

            return (
              <div className="form-check" key={platformID}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`plat-${platformID}`}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => handleToggle(platformID)}
                />
                <label className="form-check-label" htmlFor={`plat-${platformID}`}>
                  {getPlatformName(platformID)}
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
