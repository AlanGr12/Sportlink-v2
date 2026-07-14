import React from 'react';

export const IconoEntrenamientos = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 8h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1M6 8H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1M2 12h20" strokeWidth="2.5" />
    <rect x="6" y="5" width="2" height="14" rx="1" />
    <rect x="16" y="5" width="2" height="14" rx="1" />
  </svg>
);
