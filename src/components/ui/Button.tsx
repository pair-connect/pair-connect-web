import React, { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "doubleColorButton";
  size?: "sm" | "md" | "lg" | "icon";
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}, ref) => {
  const baseStyles =
    "cursor-pointer font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-cyan text-[#0b0c10] hover:bg-cyan-light",
    secondary: "bg-magenta text-[#0b0c10] hover:bg-magenta-light",
    outline:
      "border-2 border-cyan text-[var(--color-light)] hover:bg-cyan hover:text-[#0b0c10]",
    ghost: "text-[var(--color-light)] hover:bg-[var(--color-dark-card)]",
    doubleColorButton: "bg-gradient-to-r from-cyan to-magenta text-[#0b0c10] hover:opacity-90",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    icon: "h-8 w-8 p-0 flex items-center justify-center",
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
