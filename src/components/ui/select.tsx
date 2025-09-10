import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  className?: string
  disabled?: boolean
}

const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ width: 0 })
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    setPosition({
      width: rect.width,
    })
  }, [])

  const handleToggle = React.useCallback(() => {
    if (disabled) return

    if (!isOpen) {
      calculatePosition()
    }
    setIsOpen(!isOpen)
  }, [disabled, isOpen, calculatePosition])

  const handleSelect = React.useCallback((optionValue: string) => {
    onValueChange(optionValue)
    setIsOpen(false)
  }, [onValueChange])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        handleToggle()
      }
    }
  }, [disabled, isOpen, handleToggle])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="mt-2 bg-white absolute z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
          style={{
            width: position.width,
          }}
        >
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  value === option.value && "bg-accent text-accent-foreground"
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {value === option.value && <Check className="h-4 w-4" />}
                </span>
                <span className="flex items-center gap-2 truncate">
                  {option.icon}
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { Select }
export type { SelectOption }