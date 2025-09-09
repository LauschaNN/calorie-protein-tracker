import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SimpleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const calculatePosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
    }
    return { top: 0, left: 0, width: 0 };
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        const position = calculatePosition();
        setDropdownPosition(position);
      }
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (selectRef.current && !selectRef.current.contains(target)) {
        // Check if click is on dropdown content
        const dropdownElement = document.querySelector('[data-simple-select-dropdown]');
        if (!dropdownElement || !dropdownElement.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span className="truncate">
          {selectedOption ? (
            <div className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </div>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[999998]"
            onClick={() => setIsOpen(false)}
          />
          <div 
            data-simple-select-dropdown
            className="fixed rounded-md border bg-white text-gray-900 shadow-2xl animate-in fade-in-0 zoom-in-95" 
            style={{ 
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 999999,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
                  value === option.value && "bg-blue-50 text-blue-900"
                )}
                style={{ backgroundColor: value === option.value ? '#eff6ff' : 'transparent' }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {value === option.value && <Check className="h-4 w-4" />}
                </span>
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>
        </>,
        document.body
      )}
    </div>
  );
};

export { SimpleSelect };
