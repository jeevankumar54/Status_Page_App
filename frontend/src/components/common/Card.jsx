import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  headerActions,
  noPadding = false,
  className = '',
  ...rest
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden ${className}`}
      {...rest}
    >
      {(title || headerActions) && (
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200">
          <div>
            {title && <h3 className="text-lg font-medium text-neutral-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;