import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const FontSizeToggle: React.FC = () => {
  const { fontSize, increaseFontSize } = useContext(ThemeContext);

  const getFontSizeLabel = () => {
    switch (fontSize) {
      case 'normal':
        return 'A';
      case 'large':
        return 'A+';
      case 'larger':
        return 'A++';
      default:
        return 'A';
    }
  };

  const getAriaLabel = () => {
    switch (fontSize) {
      case 'normal':
        return 'Increase font size to large';
      case 'large':
        return 'Increase font size to larger';
      case 'larger':
        return 'Reset font size to normal';
      default:
        return 'Change font size';
    }
  };

  return (
    <button 
      onClick={increaseFontSize}
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold"
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      <span className={`${fontSize === 'normal' ? 'text-base' : fontSize === 'large' ? 'text-lg' : 'text-xl'}`}>
        {getFontSizeLabel()}
      </span>
    </button>
  );
};

export default FontSizeToggle;
