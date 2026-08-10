import React from 'react';

const CustomSelect = ({ id, value, setValue, options = [], placeholder, style, searchable = false, searchQuery, setSearchQuery, openDropdown, setOpenDropdown, toggleDropdown }) => {
  const displayOptions = searchable && searchQuery 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div className="custom-dropdown" style={style}>
      <button
        className="dropdown-toggle tab-dropdown-btn"
        onClick={() => toggleDropdown(id)}
        style={{ width: '100%' }}
      >
        <span className="dropdown-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value ? (options.find(opt => opt.value === value)?.label || value) : placeholder}
        </span>
        <span className={`arrow ${openDropdown === id ? 'open' : ''}`}>▼</span>
      </button>
      {openDropdown === id && (
        <ul className="dropdown-menu" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {searchable && (
            <li className="dropdown-search" style={{ padding: '8px', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                placeholder="소재 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </li>
          )}
          {displayOptions.length > 0 ? displayOptions.map(opt => (
            <li 
              key={opt.value} 
              className={value === opt.value ? 'active' : ''} 
              onClick={() => { setValue(opt.value); setOpenDropdown(null); }}
              style={{ padding: '8px 12px', cursor: 'pointer' }}
            >
              <span className="option-text">{opt.label}</span>
            </li>
          )) : (
            <li style={{ padding: '8px 12px', color: '#999', cursor: 'default' }}>{searchable && searchQuery ? '검색 결과가 없습니다' : '옵션이 없습니다'}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
