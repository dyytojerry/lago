import React from "react";

interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  error,
  required,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          className={`w-4 h-4 text-primary-500 border-neutral-300 rounded
                     focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${error ? "border-error-300" : ""}
                     ${className}`}
          style={{ lineHeight: "28px", appearance: "auto" }}
          {...props}
        />
        {label && (
          <span className="text-sm font-medium text-neutral-700 leading-7">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </span>
        )}
      </label>
      {error && <p className="mt-1 text-sm text-error-600 ml-7">{error}</p>}
    </div>
  );
};
