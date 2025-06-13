// searchUtils.js - Enhanced search utilities with comprehensive highlighting

/**
 * Escapes special regex characters in search term
 */
export const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  /**
   * Highlights all instances of search term in text
   */
  export const highlightMatches = (text, searchTerm, options = {}) => {
    const {
      isCurrentMatch = false,
      caseSensitive = false,
      wholeWord = false,
      className = '',
      style = {}
    } = options;
  
    // Return original text if no search term or text
    if (!text || !searchTerm || typeof text !== 'string') {
      return text;
    }
  
    // Create regex based on options
    let flags = caseSensitive ? 'g' : 'gi';
    const escapedTerm = escapeRegExp(searchTerm.trim());
    const pattern = wholeWord ? `\\b${escapedTerm}\\b` : escapedTerm;
    const regex = new RegExp(`(${pattern})`, flags);
  
    // Split text and highlight matches
    const parts = text.split(regex);
  
    return parts.map((part, index) => {
      const isMatch = regex.test(part);
      
      if (isMatch) {
        const baseStyle = {
          padding: '2px 4px',
          borderRadius: '3px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          ...style
        };
  
        const highlightStyle = isCurrentMatch 
          ? {
              ...baseStyle,
              backgroundColor: 'rgba(147, 51, 234, 0.4)',
              color: '#581c87',
              fontWeight: '600',
              boxShadow: '0 0 0 1px rgba(147, 51, 234, 0.5)'
            }
          : {
              ...baseStyle,
              backgroundColor: 'rgba(255, 235, 59, 0.6)',
              color: '#713f12'
            };
  
        return (
          <mark
            key={index}
            className={`search-highlight ${isCurrentMatch ? 'current-search-highlight' : ''} ${className}`}
            style={highlightStyle}
          >
            {part}
          </mark>
        );
      }
      
      return part;
    });
  };
  
  /**
   * Advanced search function for inventory items
   */
  export const searchInventoryItems = (items, searchTerm, options = {}) => {
    const {
      fields = ['productName', 'sku', 'variantId'],
      caseSensitive = false,
      wholeWord = false,
      limit = 1000
    } = options;
  
    if (!searchTerm?.trim()) return [];
  
    const results = [];
    const searchLower = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    const searchLimit = Math.min(items.length, limit);
  
    for (let i = 0; i < searchLimit; i++) {
      const item = items[i];
      const matchedFields = [];
      let hasMatch = false;
  
      // Check each specified field
      fields.forEach(field => {
        const fieldValue = item[field];
        if (fieldValue != null) {
          const valueStr = fieldValue.toString();
          const compareValue = caseSensitive ? valueStr : valueStr.toLowerCase();
          
          const isMatch = wholeWord 
            ? new RegExp(`\\b${escapeRegExp(searchLower)}\\b`, caseSensitive ? 'g' : 'gi').test(compareValue)
            : compareValue.includes(searchLower);
  
          if (isMatch) {
            hasMatch = true;
            matchedFields.push(field);
          }
        }
      });
  
      if (hasMatch) {
        results.push({
          index: i,
          item,
          matchedFields,
          relevance: calculateRelevance(item, searchTerm, matchedFields)
        });
      }
    }
  
    // Sort by relevance (highest first)
    return results.sort((a, b) => b.relevance - a.relevance);
  };
  
  /**
   * Calculate relevance score for search results
   */
  const calculateRelevance = (item, searchTerm, matchedFields) => {
    let score = 0;
    const searchLower = searchTerm.toLowerCase();
  
    matchedFields.forEach(field => {
      const fieldValue = item[field]?.toString().toLowerCase() || '';
      
      // Exact match gets highest score
      if (fieldValue === searchLower) {
        score += 100;
      }
      // Starts with search term
      else if (fieldValue.startsWith(searchLower)) {
        score += 50;
      }
      // Contains search term
      else if (fieldValue.includes(searchLower)) {
        score += 25;
      }
  
      // Bonus points for shorter matches (more specific)
      const lengthRatio = searchTerm.length / fieldValue.length;
      score += lengthRatio * 10;
  
      // Field priority bonuses
      if (field === 'productName') score += 10;
      if (field === 'sku') score += 5;
    });
  
    return score;
  };
  
  /**
   * React hook for search functionality
   */
  import { useState, useEffect, useCallback, useRef } from 'react';
  
  export const useSearch = (items, options = {}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const timeoutRef = useRef(null);
  
    const { debounceMs = 300, ...searchOptions } = options;
  
    // Debounce search term
    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
  
      setIsSearching(true);
      timeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setIsSearching(false);
      }, debounceMs);
  
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [searchTerm, debounceMs]);
  
    // Perform search when debounced term changes
    useEffect(() => {
      if (debouncedSearchTerm.trim()) {
        const searchResults = searchInventoryItems(items, debouncedSearchTerm, searchOptions);
        setResults(searchResults);
        setCurrentIndex(0);
      } else {
        setResults([]);
        setCurrentIndex(0);
      }
    }, [debouncedSearchTerm, items]);
  
    const goToNext = useCallback(() => {
      if (results.length === 0) return;
      setCurrentIndex(prev => (prev + 1) % results.length);
    }, [results.length]);
  
    const goToPrevious = useCallback(() => {
      if (results.length === 0) return;
      setCurrentIndex(prev => prev === 0 ? results.length - 1 : prev - 1);
    }, [results.length]);
  
    const clear = useCallback(() => {
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setResults([]);
      setCurrentIndex(0);
    }, []);
  
    return {
      searchTerm,
      setSearchTerm,
      debouncedSearchTerm,
      results,
      currentIndex,
      isSearching,
      goToNext,
      goToPrevious,
      clear,
      hasResults: results.length > 0,
      currentResult: results[currentIndex] || null
    };
  };