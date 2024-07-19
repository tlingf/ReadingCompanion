import React from 'react';

const Input = ({ value, onChange, placeholder, className }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-2 border rounded ${className}`}
  />
);

export default Input;