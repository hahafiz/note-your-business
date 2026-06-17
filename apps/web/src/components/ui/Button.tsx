import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline"
  | "ghost";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "font-normal bg-black rounded-xl hover:bg-gray-800 text-white focus:ring-black",
    secondary:
      "font-normal bg-gray-200 rounded-xl hover:bg-gray-300 text-gray-900 focus:ring-gray-300",
    success:
      "font-normal bg-green-600 rounded-xl hover:bg-green-700 text-white focus:ring-green-500",
    danger:
      "font-normal bg-red-600 rounded-xl hover:bg-red-700 text-white focus:ring-red-500",
    outline:
      "font-normal bg-transparent rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 rounded-xl",
    ghost:
      "font-medium bg-transparent rounded-xl hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    xs: "text-xs",
    sm: "text-sm",
    md: "py-2 px-4 text-sm",
    lg: "py-2.5 px-5 text-base",
    xl: "py-3 px-6 text-lg",
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? "opacity-50 cursor-not-allowed" : "",
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export { Button };
