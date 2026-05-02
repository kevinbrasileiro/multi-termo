import { forwardRef, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string 
  error?: string
  className?: string
  
  value?: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      className = "",
      value,
      onChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputClasses = 
    `border-wrong hover:border-correct bg-dark ${props.type === "number" ? "px-0" : "px-3"} py-2 text-base focus:outline-none rounded-lg border-2 focus:border-correct transition-colors w-full
    ${error ? "border-danger" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${props.type === "number" ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""}
    ${className}`

    return (
      <div className={`w-full ${disabled ? "opacity-50" : ""}`}>
      {label && (
        <div className="flex justify-center">
          <div className="relative">
            <span className="text-base">
              {label}
            </span>
          </div>
        </div>
      )}
      <div className="relative">      
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          className={inputClasses}
          disabled={disabled}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      </div>

      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
    )
  }
)