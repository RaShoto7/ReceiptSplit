'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSuggestions, getCategoryIcon, FoodItem } from '@/lib/foodSuggestions';

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSuggestionSelect?: (item: FoodItem) => void;
}

export function SmartInput({
  value,
  onChange,
  placeholder,
  className = '',
  onSuggestionSelect,
}: SmartInputProps) {
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get suggestions when value changes
  useEffect(() => {
    if (value.length >= 1) {
      const results = getSuggestions(value, 12); // More suggestions for horizontal scroll
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((item: FoodItem) => {
    onChange(item.name);
    setShowSuggestions(false);
    onSuggestionSelect?.(item);
    // Blur the input to close the keyboard on mobile
    inputRef.current?.blur();
  }, [onChange, onSuggestionSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedElement = container.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= 1 && suggestions.length > 0 && setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Horizontal scrollable suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 left-0 right-0 mt-2 animate-scale-in"
        >
          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {suggestions.map((item, index) => (
              <button
                key={`${item.name}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl text-left transition-all touch-manipulation ${
                  index === selectedIndex
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md hover:shadow-lg border border-slate-100 dark:border-slate-700'
                }`}
                style={{ minWidth: 'max-content' }}
              >
                <span className={`text-lg w-8 h-8 flex items-center justify-center rounded-lg ${
                  index === selectedIndex
                    ? 'bg-white/20'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  {getCategoryIcon(item.category)}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.name}
                  </span>
                  <span className={`text-[10px] capitalize ${
                    index === selectedIndex
                      ? 'text-white/70'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {item.category}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Scroll hint gradient */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent" />

          {/* Touch hint */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1 flex items-center justify-center gap-1">
            <span>👆</span>
            <span>Glissez pour voir plus</span>
          </p>
        </div>
      )}

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
