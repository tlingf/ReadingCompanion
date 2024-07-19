import React from 'react';

const Progress = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded ${className}`}>
    <div
      className="bg-blue-500 rounded h-2"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

export default Progress;