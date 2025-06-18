import React from 'react';
import { Button } from './button';
import { Input } from './input';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  buttonLabel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  className = '',
  inputClassName = 'w-full max-w-xs',
  buttonClassName = '',
  buttonLabel = 'Search',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <Input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />
      <Button
        onClick={onSearch}
        className={buttonClassName}>
        {buttonLabel}
      </Button>
    </div>
  );
};

export default SearchBar;
