import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children, className = '' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-negro/40 backdrop-blur-sm animate-fade-in p-4"
    >
      <div
        className={`
          bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-auto w-full
          animate-scale-in ${className || 'max-w-md'}
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <h3 className="font-heading font-bold text-lg text-negro">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gris hover:bg-gris-light hover:text-negro transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={title ? 'p-6' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}
