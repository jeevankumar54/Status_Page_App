import React from 'react';

/**
 * Badge component for status indicators and tags
 */
const Badge = ({
  children,
  variant = 'gray',
  size = 'md',
  rounded = true,
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  // Rounded classes
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  // Variant classes
  const variantClasses = {
    gray: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
    red: 'bg-danger-100 text-danger-800 border border-danger-200',
    yellow: 'bg-warning-100 text-warning-800 border border-warning-200',
    green: 'bg-success-100 text-success-800 border border-success-200',
    blue: 'bg-primary-100 text-primary-800 border border-primary-200',
    purple: 'bg-violet-100 text-violet-800 border border-violet-200',
    indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    pink: 'bg-pink-100 text-pink-800 border border-pink-200',
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${roundedClasses}
        ${variantClasses[variant]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;