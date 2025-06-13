// TextHighlighter.js - Utility component to highlight matched text
import React from 'react';

export const highlightText = (text, searchTerm, isCurrentMatch = false) => {
  if (!text || !searchTerm || typeof text !== 'string') {
    return text;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <mark
          key={index}
          className={`${
            isCurrentMatch 
              ? 'bg-purple-300 text-purple-900 font-semibold' 
              : 'bg-yellow-200 text-yellow-900'
          } px-1 rounded`}
          style={{
            backgroundColor: isCurrentMatch ? 'rgba(147, 51, 234, 0.4)' : 'rgba(255, 235, 59, 0.6)',
            color: isCurrentMatch ? '#581c87' : '#713f12'
          }}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
};

// React component version for more complex highlighting
export const HighlightedText = ({ 
  text, 
  searchTerm, 
  isCurrentMatch = false,
  className = '',
  ...props 
}) => {
  const highlightedText = highlightText(text, searchTerm, isCurrentMatch);
  
  return (
    <span className={className} {...props}>
      {highlightedText}
    </span>
  );
};

export default HighlightedText;