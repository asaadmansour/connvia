import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './HierarchicalMultiSelect.module.css';

const HierarchicalMultiSelect = ({
  label,
  icon,
  options,
  selectedItems,
  onChange,
  placeholder,
  error,
  touched,
  loading = false,
  loadingText = 'Loading options...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId, e) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle item selection
  const handleItemSelect = (item, e) => {
    e.stopPropagation();
    
    const isSelected = selectedItems.some(
      selected => selected.id === item.id
    );
    
    let newSelectedItems;
    
    if (isSelected) {
      newSelectedItems = selectedItems.filter(
        selected => selected.id !== item.id
      );
    } else {
      newSelectedItems = [...selectedItems, item];
    }
    
    onChange(newSelectedItems);
  };

  // Check if an item is selected
  const isItemSelected = (itemId) => {
    return selectedItems.some(item => item.id === itemId);
  };

  return (
    <div className={styles.multiSelectContainer} ref={dropdownRef}>
      <div 
        className={`${styles.selectHeader} ${touched && error ? styles.error : ''} ${isOpen ? styles.active : ''}`}
        onClick={toggleDropdown}
      >
        <span className={styles.inputIcon}>{icon}</span>
        <div className={styles.selectedDisplay}>
          {selectedItems.length > 0 ? (
            <div className={styles.selectedItemsContainer}>
              {selectedItems.map(item => (
                <span key={item.id} className={styles.selectedItem}>
                  {item.name}
                  <button 
                    type="button"
                    className={styles.removeItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemSelect(item, e);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <span className={`${styles.dropdownArrow} ${isOpen ? styles.up : ''}`}>▼</span>
      </div>
      
      {touched && error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <span>{loadingText}</span>
            </div>
          ) : options.length === 0 ? (
            <div className={styles.noOptions}>No options available</div>
          ) : (
            <ul className={styles.optionsList}>
              {options.map(category => (
                <li key={category.id} className={styles.categoryItem}>
                  <div 
                    className={styles.categoryHeader}
                    onClick={(e) => toggleCategory(category.id, e)}
                  >
                    <span className={styles.categoryName}>{category.name}</span>
                    <span className={styles.expandIcon}>
                      {expandedCategories[category.id] ? '−' : '+'}
                    </span>
                  </div>
                  
                  {expandedCategories[category.id] && category.children && (
                    <ul className={styles.subOptionsList}>
                      {category.children.map(subItem => (
                        <li 
                          key={subItem.id} 
                          className={`${styles.subItem} ${isItemSelected(subItem.id) ? styles.selected : ''}`}
                          onClick={(e) => handleItemSelect(subItem, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isItemSelected(subItem.id)}
                            onChange={() => {}}
                            className={styles.checkbox}
                          />
                          <span className={styles.itemName}>{subItem.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      <label className={`${styles.floatingLabel} ${selectedItems.length > 0 ? styles.hasContent : ''}`}>
        {/* Label removed to prevent duplication */}
      </label>
    </div>
  );
};

HierarchicalMultiSelect.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          name: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
  loading: PropTypes.bool,
  loadingText: PropTypes.string
};

export default HierarchicalMultiSelect;
