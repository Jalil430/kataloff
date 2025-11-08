import React from "react";

export default function OptionSelectors({ hasDown, hasGuarantor, onDownToggle, onGuarantorChange }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <button
        onClick={() => onDownToggle(!hasDown)}
        className={`option-button ${hasDown ? 'active' : ''}`}
      >
        <span style={{ fontSize: '20px', fontWeight: '300' }}>₽</span>
        Первый взнос
      </button>
      <button
        onClick={() => onGuarantorChange(!hasGuarantor)}
        className={`option-button ${hasGuarantor ? 'active' : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20 21V19C20 17.9 19.6 16.9 18.8 16.2C18.1 15.4 17.1 15 16 15H8C6.9 15 5.9 15.4 5.2 16.2C4.4 16.9 4 17.9 4 19V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Поручитель
      </button>
    </div>
  );
}
