import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  required,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2 leading-7">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 border border-gray-200 rounded-lg 
                   focus:ring-2 focus:ring-primary-coral focus:border-transparent
                   placeholder:text-gray-400 text-text-primary resize-none
                   disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                   ${error ? 'border-red-300 focus:ring-red-500' : ''}
                   ${className}`}
        style={{ lineHeight: '28px' }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
