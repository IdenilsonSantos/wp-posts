interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClasses =
    "btn w-full py-2 px-4 rounded-md text-white transition-colors focus:outline-none";

  const variants: Record<string, string> = {
    primary: "bg-gray-700 hover:bg-gray-600",
    secondary: "bg-gray-700 hover:bg-gray-600",
    success: "bg-emerald-500 hover:bg-emerald-600",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
