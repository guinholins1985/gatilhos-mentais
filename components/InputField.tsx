import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  isTextArea?: boolean;
  optional?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  isTextArea = false,
  optional = false,
}) => {
  const commonProps = {
    name,
    value,
    onChange,
    placeholder,
    className:
      'w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-gray-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200',
  };

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={name} className="font-semibold text-slate-300">
        {label}{' '}
        {optional && <span className="text-slate-500 font-normal">(Opcional)</span>}
      </label>
      {isTextArea ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input {...commonProps} type="text" />
      )}
    </div>
  );
};

export default InputField;
