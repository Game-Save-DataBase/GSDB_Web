import React from "react";
import { Form } from "react-bootstrap";

function FilterDate({ label, value, onChange }) {
  return (
    <Form.Group className="mb-0 w-100">
      <Form.Label className="small">{label}</Form.Label>
      <Form.Control
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control-sm"
      />
    </Form.Group>
  );
}

export default FilterDate;
