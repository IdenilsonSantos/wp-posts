import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface Option {
  label: string;
  value: string | number;
}

interface SelectInputProps<T extends FieldValues>
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Option[];
  errorClassName?: string;
  wrapperClassName?: string;
  selectClassName?: string;
}

const SelectInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Selecione",
  options,
  errorClassName = "text-red-500 text-sm mt-1",
  wrapperClassName = "flex flex-col mb-2",
  selectClassName,
  ...rest
}: SelectInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={wrapperClassName}>
          {label && (
            <label
              htmlFor={name}
              className="mb-1 font-medium text-gray-300 text-sm"
            >
              {label}
            </label>
          )}

          <select
            {...field}
            {...rest}
            id={name}
            className={`w-full px-3 py-2 rounded-md bg-gray-700 text-white 
              focus:outline-none focus:ring-2 transition 
              ${
                fieldState.error
                  ? "focus:ring-red-500 border border-red-500"
                  : "focus:ring-emerald-400 border border-gray-600"
              } ${selectClassName || ""}`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {fieldState.error && (
            <span className={errorClassName}>{fieldState.error.message}</span>
          )}
        </div>
      )}
    />
  );
};

export default SelectInput;
