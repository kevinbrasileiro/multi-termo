import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  className?: string
  height?: string
  width?: string
}

export default function Button({
  children, 
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {

const baseStyle ="relative focus:outline-none transition-colors duration-150 rounded-lg bg-dark"

  const sizeStyles = {
    sm: "px-2 py-1 text-sm border-1",
    md: "px-3 py-2 text-base border-2",
    lg: "px-4 py-3 text-lg border-3 tracking-wider",
  }[size]

  const variantStyles = {
    primary: `border-wrong-light ${disabled ? "" : "hover:border-correct"}`,
    secondary: "border-wrong text-white hover:bg-wrong",
    danger: "text-danger border-danger hover:bg-danger hover:border-danger hover:text-white",
  }[variant]

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"

  const widthStyle = fullWidth ? "w-full" : ""

  return (
    <button
      className={`${baseStyle} ${sizeStyles} ${variantStyles} ${disabledStyles} ${widthStyle} ${className} flex items-center justify-center`}
      disabled={disabled}
      {...props}
    >
      {children && <span>{children}</span>}
    </button>
  )
}