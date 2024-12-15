import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{
    value: string;
    label: string;
  }>;
  error?: string;
}

export function Select({ options, error, className = '', ...props }: SelectProps) {
  return (
    <div>
      <select
        {...props}
        className={`
          w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5
          text-gray-900 text-sm
          outline-none transition-all duration-200
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}