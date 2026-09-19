import React from 'react'

const Modal = ({title, onClose, isOpen, children, label = "new ticket"}) => {

    if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm'>
      <div className='w-full max-w-md overflow-hidden rounded-2xl border border-ink bg-surface shadow-[0_30px_80px_-30px_rgba(22,20,15,0.5)]'>

        {/* Header */}
        <div className='flex items-center justify-between border-b border-ink px-5 py-3'>
            <div>
              <p className='mono-label'>{label}</p>
              <h2 className='text-xl font-semibold tracking-tight text-ink'>{title}</h2>
            </div>
            <button
              aria-label="Close"
              className='flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-muted hover:bg-paper hover:text-ink'
              onClick={onClose}
            >
                &times;
            </button>
        </div>

        {/* Content */}
        <div className='p-5'>
            {children}
        </div>

      </div>
    </div>
  )
}

export default Modal
