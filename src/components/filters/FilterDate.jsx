import React from "react";
import { Form } from "react-bootstrap";

function FilterDate({ label, value, onChange }) {
  return (
    <Form.Group className="mb-0 w-100">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Form.Group>

  );
}

export default FilterDate;
