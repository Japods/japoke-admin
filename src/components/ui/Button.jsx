import Spinner from './Spinner';

const variants = {
  primary: 'bg-naranja text-white hover:bg-naranja-dark active:scale-[0.97]',
  secondary: 'bg-dorado text-white hover:bg-dorado/90 active:scale-[0.97]',
  danger: 'bg-error text-white hover:bg-error/90 active:scale-[0.97]',
  ghost: 'bg-transparent text-gris hover:bg-gris-light active:scale-[0.97]',
  outline: 'border border-gris-border bg-white text-negro hover:bg-gris-light active:scale-[0.97]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
