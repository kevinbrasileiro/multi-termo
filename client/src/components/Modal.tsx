type ModalProps = {
  isOpen: boolean
  children: React.ReactNode
}

export default function Modal({isOpen, children}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md p-6 shadow-lg">
        {children}
      </div>
    </div>
  )
}