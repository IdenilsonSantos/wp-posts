import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  register,
  error,
  ...props
}) => {
  return (
    <div className="flex flex-col mb-2 w-full">
      <fieldset className="fieldset w-full">
        {label && (
          <legend className="fieldset-legend text-gray-300">{label}</legend>
        )}

        <input
          id={id}
          {...register}
          {...props}
          className={`w-full mt-2 px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none 
                focus:ring-2 ${
                  error
                    ? "focus:ring-red-500 border-red-500"
                    : "focus:ring-emerald-400"
                }`}
        />

        <div className="h-2 mt-2">
          {error && (
            <p className="label text-red-500 text-sm">{error.message}</p>
          )}
        </div>
      </fieldset>
    </div>
  );
};
