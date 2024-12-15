import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500/50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300/50",
    ghost: "bg-white/10 text-white hover:bg-white/20"
  };

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          جاري التحميل...
        </div>
      ) : (
        children
      )}
    </button>
  );
}