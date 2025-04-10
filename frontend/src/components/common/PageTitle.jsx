import React from 'react';

const PageTitle = ({ 
  title, 
  description = '', 
  actions = null, 
  className = '',
  backLink = null,
  onBack = null,
}) => {
  return (
    <div className={`pb-5 border-b border-neutral-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {(backLink || onBack) && (
            <button
              onClick={onBack || (() => window.history.back())}
              className="mr-2 p-1 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
};

export default PageTitle;