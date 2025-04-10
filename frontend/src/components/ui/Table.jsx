import React from 'react';

/**
 * Table component for displaying data in rows and columns
 */
const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = '',
  cellClassName = '',
}) => {
  // Determine if table is clickable
  const isClickable = typeof onRowClick === 'function';
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 shadow-sm rounded-lg overflow-hidden">
        <div className="flex justify-center items-center h-32">
          <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-neutral-200 shadow-sm rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className={`bg-neutral-50 ${headerClassName}`}>
            <tr>
              {columns.map((column, columnIndex) => (
                <th
                  key={columnIndex}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-neutral-200 ${bodyClassName}`}>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-10 text-center text-sm text-neutral-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                    ${rowClassName}
                    ${isClickable ? 'cursor-pointer hover:bg-neutral-50' : ''}
                  `}
                  onClick={isClickable ? () => onRowClick(row, rowIndex) : undefined}
                >
                  {columns.map((column, columnIndex) => (
                    <td
                      key={columnIndex}
                      className={`px-6 py-4 text-sm ${
                        column.align === 'right' 
                        ? 'text-right' 
                        : column.align === 'center' 
                          ? 'text-center' 
                          : 'text-left'
                      } ${cellClassName} ${column.cellClassName || ''}`}
                    >
                      {column.render 
                        ? column.render(row, rowIndex) 
                        : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;