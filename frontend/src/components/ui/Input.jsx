import React, { forwardRef } from 'react';

/**
 * Input component for forms with consistent styling
 */
const Input = forwardRef(({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  leftAddon,
  rightAddon,
  ...rest
}, ref) => {
  const inputClasses = `
    block w-full px-3 py-2 
    ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'} 
    ${disabled ? 'bg-neutral-100 cursor-not-allowed text-neutral-500' : 'bg-white'} 
    ${leftAddon ? 'rounded-r-md' : 'rounded-l-md'} 
    ${rightAddon ? 'rounded-l-md' : 'rounded-r-md'} 
    ${!leftAddon && !rightAddon ? 'rounded-md' : ''}
    shadow-sm focus:outline-none sm:text-sm
    ${className}
  `;

  // Render input with or without label
  return (
    <div className={`${containerClassName}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      {/* Input with possible addons */}
      <div className="flex rounded-md shadow-sm">
        {/* Left addon */}
        {leftAddon && (
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 sm:text-sm">
            {leftAddon}
          </span>
        )}
        
        {/* Input element */}
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...rest}
        />
        
        {/* Right addon */}
        {rightAddon && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 text-neutral-500 sm:text-sm">
            {rightAddon}
          </span>
        )}
      </div>

      {/* Error message or hint */}
      {error ? (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;