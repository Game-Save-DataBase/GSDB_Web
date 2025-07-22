import React, { useState, useEffect, useRef } from "react";
import { Dropdown, Form, InputGroup } from "react-bootstrap";

function FilterSelect({ label, options, selected = [], onChange }) {
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef(null);

  // Filtrar opciones según búsqueda
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (isOpen) => {
    setShow(isOpen);
    if (!isOpen) {
      setSearchTerm(""); // limpiar búsqueda al cerrar
    }
  };

  const handleCheck = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Cerrar dropdown si clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false);
        setSearchTerm("");
      }
    };
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  return (
    <div ref={ref} style={{ minWidth: "220px" }}>
      <Dropdown show={show} onToggle={handleToggle}>
        <Dropdown.Toggle variant="outline-secondary" id="dropdown-platforms">
          {label} {selected.length > 0 ? `(${selected.length})` : ""}
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ maxHeight: "250px", overflowY: "auto", padding: "0.5rem" }}>
          <InputGroup className="mb-2">
            <Form.Control
              type="search"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </InputGroup>

          {filteredOptions.length === 0 && (
            <div className="text-muted px-3">No options found</div>
          )}

          {filteredOptions.map((opt) => (
            <Form.Check
              key={opt.value}
              type="checkbox"
              id={`filter-${opt.value}`}
              label={opt.label}
              checked={selected.includes(opt.value)}
              onChange={() => handleCheck(opt.value)}
              className="mx-3"
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default FilterSelect;
