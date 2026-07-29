import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import './AutocompleteField.css';

export interface AutocompleteOption<T = unknown> {
  id: string | number;
  label: string;
  sublabel?: string;
  value: T;
}

export interface AutocompleteFieldProps<T = unknown> {
  id?: string;
  label: string;
  name: string;
  value: string;
  options: AutocompleteOption<T>[];
  onValueChange: (value: string) => void;
  onOptionSelect: (option: AutocompleteOption<T>) => void;
  loading?: boolean;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'tel' | 'search';
  autoComplete?: string;
  emptyMessage?: string;
  minLengthToOpen?: number;
  showEmptyState?: boolean;
}

/**
 * Поле ввода с выпадающим списком подсказок в стиле Bootstrap form-control.
 */
export function AutocompleteField<T>({
  id,
  label,
  name,
  value,
  options,
  onValueChange,
  onOptionSelect,
  loading = false,
  hint,
  placeholder,
  required = false,
  type = 'text',
  autoComplete = 'off',
  emptyMessage = 'Ничего не найдено',
  minLengthToOpen = 1,
  showEmptyState = false,
}: AutocompleteFieldProps<T>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listboxId = `${fieldId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const canOpen = value.trim().length >= minLengthToOpen;
  const showMenu =
    isOpen &&
    canOpen &&
    (loading || options.length > 0 || (showEmptyState && !loading));

  useEffect(() => {
    setActiveIndex(-1);
  }, [options, value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  /**
   * Открывает список подсказок при фокусе на поле.
   */
  const handleFocus = (): void => {
    if (canOpen) {
      setIsOpen(true);
    }
  };

  /**
   * Обновляет значение поля и открывает список подсказок.
   * @param nextValue - Новое значение input.
   */
  const handleChange = (nextValue: string): void => {
    onValueChange(nextValue);
    setIsOpen(nextValue.trim().length >= minLengthToOpen);
  };

  /**
   * Выбирает подсказку из списка.
   * @param option - Выбранный элемент.
   */
  const handleSelect = (option: AutocompleteOption<T>): void => {
    onOptionSelect(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  /**
   * Навигация по списку с клавиатуры.
   * @param event - Событие keydown.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (!showMenu || options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1 >= options.length ? 0 : index + 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 < 0 ? options.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(options[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="autocomplete-field" ref={rootRef}>
      <label className="form-label" htmlFor={fieldId}>
        {label}
      </label>

      <div className="input-group">
        <input
          id={fieldId}
          className="form-control"
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          role="combobox"
          aria-expanded={showMenu}
          aria-controls={listboxId}
          aria-autocomplete="list"
          onChange={(event) => handleChange(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {loading && (
          <span className="input-group-text bg-white">
            <span
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
              aria-label="Поиск"
            />
          </span>
        )}
      </div>

      {hint && <div className="form-text">{hint}</div>}

      {showMenu && (
        <ul id={listboxId} className="autocomplete-field__menu list-unstyled mb-0" role="listbox">
          {loading && options.length === 0 ? (
            <li className="autocomplete-field__empty">Поиск...</li>
          ) : options.length === 0 ? (
            <li className="autocomplete-field__empty">{emptyMessage}</li>
          ) : (
            options.map((option, index) => (
              <li key={option.id} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={`autocomplete-field__item${index === activeIndex ? ' bg-light' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  <span className="autocomplete-field__item-label">{option.label}</span>
                  {option.sublabel && (
                    <span className="autocomplete-field__item-sublabel">{option.sublabel}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
