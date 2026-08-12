import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export default function CustomSelect({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prepend placeholder as the default option if provided
  const allOptions = placeholder 
    ? [{ value: '', label: placeholder }, ...options]
    : options;

  // Find selected option
  const selectedOption = allOptions.find(opt => {
    const optVal = opt.value !== undefined ? opt.value : opt.id;
    return String(optVal) === String(value);
  });

  const displayLabel = selectedOption 
    ? (selectedOption.label || selectedOption.nombre) 
    : (placeholder || 'Seleccionar...');

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      {label && <label className="custom-select-label">{label}</label>}
      <button 
        type="button" 
        className="custom-select-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">{displayLabel}</span>
        <span className="custom-select-chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 15 12 20 17 15"></polyline>
            <polyline points="7 9 12 4 17 9"></polyline>
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <ul className="custom-select-menu" role="listbox">
          {allOptions.map((opt) => {
            const optVal = opt.value !== undefined ? opt.value : opt.id;
            const optLabel = opt.label || opt.nombre;
            const isSelected = String(optVal) === String(value);
            
            return (
              <li 
                key={optVal} 
                className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange({ target: { value: optVal } });
                  setIsOpen(false);
                }}
              >
                <span className="option-text">{optLabel}</span>
                {isSelected && (
                  <span className="option-checkmark">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
