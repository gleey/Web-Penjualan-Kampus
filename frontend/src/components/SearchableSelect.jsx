import { useState, useRef, useEffect, useCallback } from 'react';

function SearchableSelect({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = 'Ketik untuk mencari...', 
  label,
  icon,
  minChars = 3,
  id = 'searchable-select',
  variant = 'light' // 'light' for product page, 'dark' for auth page
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = useCallback(async (keyword) => {
    if (keyword.length < minChars) {
      setOptions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const results = await onSearch(keyword);
      setOptions(results || []);
      setIsOpen(true);
      setHighlightIndex(-1);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch, minChars]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // If user clears input, also clear value
    if (!val) {
      onChange('');
      setOptions([]);
      setIsOpen(false);
      return;
    }

    // Debounce API call (400ms)
    debounceRef.current = setTimeout(() => {
      doSearch(val);
    }, 400);
  };

  const handleSelect = (option) => {
    setInputValue(option.nama);
    onChange(option.nama);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        handleSelect(options[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setOptions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const isDark = variant === 'dark';

  return (
    <div className={`searchable-select ${isDark ? 'searchable-select-dark' : ''}`} ref={wrapperRef} id={id}>
      {label && (
        <label className="form-label">
          {icon && <i className={`bi ${icon} me-2`}></i>}{label}
        </label>
      )}
      <div className="searchable-select-input-wrapper">
        <i className="bi bi-search searchable-select-search-icon"></i>
        <input
          ref={inputRef}
          type="text"
          className={`form-control searchable-select-input ${isDark ? '' : 'searchable-select-input-light'}`}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (options.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && (
          <div className="searchable-select-loading">
            <span className="spinner-border spinner-border-sm"></span>
          </div>
        )}
        {inputValue && !loading && (
          <button
            type="button"
            className="searchable-select-clear"
            onClick={handleClear}
            tabIndex={-1}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
      {inputValue.length > 0 && inputValue.length < minChars && (
        <div className="searchable-select-hint">
          <i className="bi bi-info-circle me-1"></i>
          Ketik minimal {minChars} karakter untuk mencari
        </div>
      )}
      {isOpen && options.length > 0 && (
        <div className="searchable-select-dropdown">
          {options.map((option, index) => (
            <div
              key={option.id || index}
              className={`searchable-select-option ${highlightIndex === index ? 'highlighted' : ''} ${inputValue === option.nama ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightIndex(index)}
            >
              <div className="searchable-select-option-icon">
                <i className="bi bi-building"></i>
              </div>
              <div className="searchable-select-option-content">
                <div className="searchable-select-option-name">{option.nama}</div>
                {option.singkatan && (
                  <div className="searchable-select-option-sub">{option.singkatan}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {isOpen && options.length === 0 && !loading && inputValue.length >= minChars && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-empty">
            <i className="bi bi-search me-2"></i>
            Tidak ada universitas ditemukan
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
