import { useState } from "react"

type ModalProps = {
  isOpen: boolean
  expandable: boolean
  children: React.ReactNode
}

export default function Modal({isOpen, expandable, children}: ModalProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!isOpen) return null

  const handleClick = () => {
    if (!expandable) return 

    setIsExpanded(prev => !prev)
  }

  return (
    <div className={`fixed inset-0 ${(isExpanded || !expandable) ? "bg-black-70 backdrop-blur-sm" : ""} z-50`}>
      <div
        onClick={handleClick} 
        className={`absolute left-1/2 -translate-x-1/2 top-1/2 bg-zinc-900 rounded-lg w-full max-w-md p-6 shadow-lg ${expandable ? isExpanded ? "-translate-y-1/2 cursor-default" : "translate-y-[38vh] cursor-pointer" : "-translate-y-1/2 cursor-default"} transition-transform duration-300`}
      >
        {expandable && (
          <div className="w-full flex justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className={`size-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}