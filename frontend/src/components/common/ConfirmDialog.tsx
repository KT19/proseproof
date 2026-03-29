interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Dialog */}
      <div className="relative bg-[#faf8f5] rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 border border-[#d4c5a9]">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-gold rounded-t-lg"></div>
        
        <div className="flex flex-col items-center text-center">
          {/* Warning icon */}
          <div className="w-16 h-16 rounded-full bg-[#f5e6d3] flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-[#8b2e38]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold font-[Playfair_Display] text-[#2c1810] mb-2">
            {title}
          </h3>
          
          <p className="text-[#5d5245] mb-6 text-sm leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-[#5d5245] bg-[#e8e0d0] hover:bg-[#d4c5a9] transition-colors duration-200 font-[Inter] text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 rounded-lg text-white bg-[#8b2e38] hover:bg-[#6b1f28] transition-colors duration-200 font-[Inter] text-sm font-medium shadow-md hover:shadow-lg"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
