import { type InputHTMLAttributes } from "react"

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string
  error?: string
  className?: string

  name: string
  options: {label: string, value: string}[]

  value: string
  onChange: (value: string) => void
}

export function Radio({
  label,
  error,
  className = "",
  name,
  options,
  value,
  onChange,
  ...props
}: RadioProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && <p className="text-base mb-1">{label}</p>}

      <div className="flex gap-4">
        {options.map((opt) => {
          const isSelected = value === opt.value

          return (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer rounded-md transition-colors"
            >
              <input
                type="radio"
                name={name}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="hidden"
                {...props}
              />

              <span className="flex items-center justify-center w-4 h-4 rounded-full border border-wrong">
                <span
                  className={`w-3 h-3 rounded-full bg-correct transition-transform duration-150
                    ${isSelected ? "scale-100" : "scale-0"}
                  `}
                />
              </span>

              <span>{opt.label}</span>
            </label>
          )
        })}
      </div>

      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}