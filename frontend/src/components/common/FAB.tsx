interface FABProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

export function FAB({ onClick, loading = false, label = 'Proof Read' }: FABProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        fixed bottom-6 right-6 w-14 h-14 rounded-full
        gradient-gold
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:scale-105 hover:brightness-110
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
        group
      `}
      title={label}
    >
      {/* Pen icon */}
      <svg
        className={`w-6 h-6 text-white transition-transform duration-300 ${
          loading ? 'animate-spin' : 'group-hover:rotate-12'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
      
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </button>
  );
}
