import { forwardRef } from "react"

interface ToggleSwitchProps {
  label?: string
  error?: string
  className?: string

  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  (
    {
      label,
      error,
      className = "",
      checked,
      onChange,
      disabled = false,
    },
    ref
  ) => {
    const switchClasses = `
      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
      ${checked ? "bg-correct" : "bg-wrong"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${className}
    `

    const knobClasses = `
      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
      ${checked ? "translate-x-6" : "translate-x-1"}
    `

    return (
      <div className="">
        {label && (
          <div className="flex justify-center mb-1">
            <span className="text-base">{label}</span>
          </div>
        )}

        <label className="flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
          />

          <div className={switchClasses}>
            <span className={knobClasses} />
          </div>
        </label>

        {error && <p className="text-danger text-xs mt-1 text-center">{error}</p>}
      </div>
    )
  }
)