interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  loading = false,
  ...props
}) => {
  const baseClasses =
    "btn py-2 px-4 rounded-md text-white transition-colors focus:outline-none flex items-center justify-center gap-2";

  const variants: Record<string, string> = {
    primary: "bg-gray-700 hover:bg-gray-600",
    secondary: "bg-gray-700 hover:bg-gray-600",
    success: "bg-emerald-500 hover:bg-emerald-600",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${
        loading ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
